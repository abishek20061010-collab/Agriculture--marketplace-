from fastapi import APIRouter
from database import execute_query

router = APIRouter()

@router.get("/farmer/{farmer_id}")
def get_farmer_revenue(farmer_id: int):
    query = """
        SELECT COALESCE(SUM(O.Quantity * C.PricePerKg), 0) AS total
        FROM Orders O JOIN Crop C ON O.CropID=C.CropID
        WHERE C.FarmerID=%s AND O.Status != 'CANCELLED'
    """
    result = execute_query(query, (farmer_id,))
    total = result[0]["total"] if result and "total" in result[0] else 0
    return {"total": total}

@router.get("/per-crop/{farmer_id}")
def get_revenue_per_crop(farmer_id: int):
    query = """
        SELECT C.CropName,
               COALESCE(SUM(O.Quantity * C.PricePerKg), 0) AS revenue,
               COUNT(O.OrderID) AS order_count
        FROM Crop C LEFT JOIN Orders O ON C.CropID=O.CropID
        WHERE C.FarmerID=%s
        GROUP BY C.CropName ORDER BY revenue DESC
    """
    return execute_query(query, (farmer_id,))
