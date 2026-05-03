from fastapi import APIRouter
from database import execute_query

router = APIRouter()

@router.get("/all")
def get_all_buyers():
    query = """
        SELECT B.BuyerID, B.Name, B.Phone, B.City,
               COUNT(CASE WHEN O.Status != 'CANCELLED' THEN O.OrderID ELSE NULL END) AS total_orders,
               COALESCE(SUM(CASE WHEN O.Status != 'CANCELLED' THEN O.Quantity * C.PricePerKg ELSE 0 END), 0) AS total_spent,
               MAX(CASE WHEN O.Status != 'CANCELLED' THEN O.OrderDate ELSE NULL END) AS last_order_date
        FROM Buyer B
        LEFT JOIN Orders O ON B.BuyerID = O.BuyerID
        LEFT JOIN Crop C ON O.CropID = C.CropID
        GROUP BY B.BuyerID, B.Name, B.Phone, B.City
        ORDER BY total_spent DESC
    """
    return execute_query(query)
