import hmac, hashlib, base64, json, time
import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from artworks.models import Artwork
from .models import Order, OrderItem, Payment
from django.db import transaction

# ── helpers ──────────────────────────────────────────────────────────────────

def esewa_signature(message: str) -> str:
    key = settings.ESEWA_SECRET_KEY.encode()
    return base64.b64encode(
        hmac.new(key, message.encode(), digestmod=hashlib.sha256).digest()
    ).decode()


def create_order(user, artwork_ids):
    with transaction.atomic():
        artworks = Artwork.objects.select_for_update().filter(
            id__in=artwork_ids,
            status='published',
            stock__gt=0
        )

        if not artworks.exists():
            raise ValueError("No valid available artworks found.")

        if artworks.count() != len(artwork_ids):
            found_ids = set(artworks.values_list('id', flat=True))
            missing   = set(int(i) for i in artwork_ids) - found_ids
            raise ValueError(f"Artworks not available: {missing}")

        total = sum(a.price for a in artworks)
        order = Order.objects.create(user=user, total=total)

        for artwork in artworks:
            OrderItem.objects.create(
                order=order,
                artwork=artwork,
                price=artwork.price
            )

        return order, total


# ── eSewa ─────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_esewa(request):
    artwork_ids = request.data.get('artwork_ids', [])
    if not artwork_ids:
        return Response({"error": "artwork_ids is required."}, status=400)

    try:
        order, total = create_order(request.user, artwork_ids)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    total_str        = str(total)
    transaction_uuid = f"{order.id}-{int(time.time())}"

    message = (
        f"total_amount={total_str},"
        f"transaction_uuid={transaction_uuid},"
        f"product_code={settings.ESEWA_PRODUCT_CODE}"
    )

    Payment.objects.create(order=order, method='esewa', transaction_id=transaction_uuid)

    return Response({
        "payment_url":             settings.ESEWA_PAYMENT_URL,
        "amount":                  total_str,
        "tax_amount":              "0",
        "service_charge":          "0",
        "delivery_charge":         "0",
        "total_amount":            total_str,
        "transaction_uuid":        transaction_uuid,
        "product_code":            settings.ESEWA_PRODUCT_CODE,
        "product_service_charge":  "0",
        "product_delivery_charge": "0",
        "success_url":             "http://localhost:5173/payment/success",
        "failure_url":             "http://localhost:5173/payment/failure",
        "signed_field_names":      "total_amount,transaction_uuid,product_code",
        "signature":               esewa_signature(message),
    })


# ── eSewa Verify — ONLY ONE DEFINITION ───────────────────────────────────────

@api_view(['GET'])
def verify_esewa(request):
    encoded = request.GET.get('data', '')
    if not encoded:
        return Response({"success": False, "message": "No data received."}, status=400)

    try:
        resp_data        = json.loads(base64.b64decode(encoded).decode())
        transaction_uuid = resp_data.get('transaction_uuid')
        total_amount     = str(resp_data.get('total_amount', '')).replace(',', '')
        status           = resp_data.get('status')

        if status != 'COMPLETE':
            return Response({"success": False, "message": f"Payment status is {status}, not COMPLETE."}, status=400)

        verify = requests.get(
            settings.ESEWA_VERIFY_URL,
            params={
                "product_code":     settings.ESEWA_PRODUCT_CODE,
                "total_amount":     total_amount,
                "transaction_uuid": transaction_uuid,
            }
        )

        try:
            vdata = verify.json()
        except Exception:
            return Response({
                "success": False,
                "message": "eSewa verification server returned non-JSON.",
                "raw": verify.text
            }, status=502)

        if vdata.get('status') == 'COMPLETE':
            try:
                payment = Payment.objects.get(transaction_id=transaction_uuid)
            except Payment.DoesNotExist:
                # ✅ Already completed on a previous call — still return success
                return Response({"success": True, "message": "Already verified."})

            order = payment.order

            # ✅ Guard: skip if already completed (idempotent)
            if order.status != 'completed':
                order.status = 'completed'
                order.save()

                Payment.objects.filter(order=order).update(
                    status='completed',
                    transaction_id=vdata.get('ref_id', transaction_uuid)
                )

                for item in order.items.all():
                    artwork = item.artwork
                    artwork.stock = max(0, artwork.stock - 1)
                    if artwork.stock == 0:
                        artwork.status = 'sold_out'
                    artwork.save()

            return Response({"success": True, "order_id": order.id})

        return Response({
            "success": False,
            "message": "eSewa verification failed.",
            "esewa_response": vdata
        }, status=400)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


# ── Khalti ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_khalti(request):
    artwork_ids = request.data.get('artwork_ids', [])
    if not artwork_ids:
        return Response({"error": "artwork_ids is required."}, status=400)

    try:
        order, total = create_order(request.user, artwork_ids)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    amount_paisa = int(total * 100)

    headers = {
        "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
        "Content-Type":  "application/json",
    }
    payload = {
        "return_url":           "http://localhost:5173/payment/success",
        "website_url":          "http://localhost:5173",
        "amount":               amount_paisa,
        "purchase_order_id":    str(order.id),
        "purchase_order_name":  "Artwork Purchase — Chitralaya",
        "customer_info": {
            "name":  request.user.full_name or request.user.email,
            "email": request.user.email,
            "phone": "9800000001",
        }
    }

    resp  = requests.post(settings.KHALTI_INITIATE_URL, json=payload, headers=headers)
    rdata = resp.json()

    if resp.status_code == 200:
        Payment.objects.create(order=order, method='khalti')
        return Response({
            "success":     True,
            "payment_url": rdata.get('payment_url'),
            "pidx":        rdata.get('pidx'),
        })

    order.delete()
    return Response({"success": False, "error": rdata}, status=400)


@api_view(['POST'])
def verify_khalti(request):
    pidx = request.data.get('pidx')
    if not pidx:
        return Response({"error": "pidx is required."}, status=400)

    headers = {
        "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
        "Content-Type":  "application/json",
    }
    resp  = requests.post(settings.KHALTI_VERIFY_URL, json={"pidx": pidx}, headers=headers)
    vdata = resp.json()

    if vdata.get('status') == 'Completed':
        order_id = vdata.get('purchase_order_id')

        try:
            order = Order.objects.get(id=int(order_id))
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=404)

        if order.status != 'completed':
            order.status = 'completed'
            order.save()

            Payment.objects.filter(order=order).update(
                status='completed',
                transaction_id=pidx
            )

            for item in order.items.all():
                artwork = item.artwork
                artwork.stock = max(0, artwork.stock - 1)
                if artwork.stock == 0:
                    artwork.status = 'sold_out'
                artwork.save()

        return Response({"success": True, "order_id": order.id})

    return Response({"success": False, "message": vdata.get('status')}, status=400)


# ── Cash on Delivery ──────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_cod_order(request):
    artwork_ids = request.data.get('artwork_ids', [])
    if not artwork_ids:
        return Response({"error": "artwork_ids is required."}, status=400)

    try:
        order, total = create_order(request.user, artwork_ids)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    Payment.objects.create(order=order, method='cod', status='pending')

    for item in order.items.all():
        artwork = item.artwork
        artwork.stock = max(0, artwork.stock - 1)
        if artwork.stock == 0:
            artwork.status = 'sold_out'
        artwork.save()

    return Response({
        "success":  True,
        "order_id": order.id,
        "total":    str(total),
        "message":  "Order placed! Pay on delivery."
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_purchases(request):
    orders = Order.objects.filter(user=request.user).prefetch_related("items__artwork").order_by("-created_at")
    data = []
    for order in orders:
        data.append({
            "id":         order.id,       # ← changed from order_id to id
            "status":     order.status,
            "total":      str(order.total),
            "created_at": order.created_at,
            "items": [                    # ← changed from artworks to items
                {
                    "artwork": {          # ← nested under artwork key
                        "title": item.artwork.title,
                        "image": request.build_absolute_uri(item.artwork.image.url) if item.artwork.image else None,
                    }
                }
                for item in order.items.all()
            ]
        })
    return Response(data)