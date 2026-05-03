from fastapi import APIRouter
from database import execute_query

router = APIRouter()

@router.get("/farmer/{farmer_id}")
def get_farmer_stats(farmer_id: int):
    total_crops_query = "SELECT COUNT(*) AS cnt FROM Crop WHERE FarmerID=%s"
    total_crops_res = execute_query(total_crops_query, (farmer_id,))
    total_crops = total_crops_res[0]["cnt"] if total_crops_res else 0
    
    total_orders_query = """
        SELECT COUNT(*) AS cnt FROM Orders O 
        JOIN Crop C ON O.CropID=C.CropID 
        WHERE C.FarmerID=%s
    """
    total_orders_res = execute_query(total_orders_query, (farmer_id,))
    total_orders = total_orders_res[0]["cnt"] if total_orders_res else 0
    
    total_revenue_query = """
        SELECT COALESCE(SUM(O.Quantity * C.PricePerKg), 0) AS total 
        FROM Orders O JOIN Crop C ON O.CropID=C.CropID 
        WHERE C.FarmerID=%s
    """
    total_revenue_res = execute_query(total_revenue_query, (farmer_id,))
    total_revenue = total_revenue_res[0]["total"] if total_revenue_res else 0
    
    warehouse_qty_query = """
        SELECT COALESCE(SUM(WC.Quantity), 0) AS total 
        FROM WarehouseCrop WC JOIN Crop C ON WC.CropID=C.CropID 
        WHERE C.FarmerID=%s
    """
    warehouse_qty_res = execute_query(warehouse_qty_query, (farmer_id,))
    warehouse_qty = warehouse_qty_res[0]["total"] if warehouse_qty_res else 0
    
    return {
        "total_crops": total_crops,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "warehouse_qty": warehouse_qty
    }

@router.get("/buyer/{buyer_id}")
def get_buyer_stats(buyer_id: int):
    total_orders_query = "SELECT COUNT(*) AS cnt FROM Orders WHERE BuyerID=%s"
    total_orders_res = execute_query(total_orders_query, (buyer_id,))
    total_orders = total_orders_res[0]["cnt"] if total_orders_res else 0
    
    delivered_orders_query = "SELECT COUNT(*) AS cnt FROM Orders WHERE BuyerID=%s AND Status='DELIVERED'"
    delivered_orders_res = execute_query(delivered_orders_query, (buyer_id,))
    delivered_orders = delivered_orders_res[0]["cnt"] if delivered_orders_res else 0
    
    pending_payment_query = """
        SELECT COUNT(*) AS cnt FROM Orders O 
        LEFT JOIN Payment P ON O.OrderID=P.OrderID 
        WHERE O.BuyerID=%s AND O.Status='PLACED' AND P.PaymentID IS NULL
    """
    pending_payment_res = execute_query(pending_payment_query, (buyer_id,))
    pending_payment = pending_payment_res[0]["cnt"] if pending_payment_res else 0
    
    last_order_date_query = "SELECT MAX(OrderDate) AS last_date FROM Orders WHERE BuyerID=%s"
    last_order_date_res = execute_query(last_order_date_query, (buyer_id,))
    last_order_date = last_order_date_res[0]["last_date"] if last_order_date_res else None
    
    return {
        "total_orders": total_orders,
        "delivered_orders": delivered_orders,
        "pending_payment": pending_payment,
        "last_order_date": last_order_date
    }
