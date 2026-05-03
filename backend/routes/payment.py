from fastapi import APIRouter, HTTPException
from database import execute_query, get_connection
from schemas import PaymentCreate

router = APIRouter()

@router.get("/pending/{buyer_id}")
def get_pending_payments(buyer_id: int):
    query = """
        SELECT O.OrderID, O.BuyerID, O.CropID, O.WarehouseID,
               O.Quantity, O.OrderDate, O.Status,
               C.CropName, C.PricePerKg,
               ROUND(O.Quantity * C.PricePerKg, 2) AS TotalAmount
        FROM Orders O JOIN Crop C ON O.CropID=C.CropID
        LEFT JOIN Payment P ON O.OrderID=P.OrderID
        WHERE O.BuyerID=%s AND O.Status='PLACED' AND P.PaymentID IS NULL
    """
    return execute_query(query, (buyer_id,))

@router.get("/history/{buyer_id}")
def get_payment_history(buyer_id: int):
    query = """
        SELECT P.PaymentID, P.OrderID, P.Amount, P.PaymentDate, P.Status, C.CropName
        FROM Payment P JOIN Orders O ON P.OrderID=O.OrderID
        JOIN Crop C ON O.CropID=C.CropID
        WHERE O.BuyerID=%s ORDER BY P.PaymentDate DESC
    """
    return execute_query(query, (buyer_id,))

@router.post("/make")
def make_payment(payment: PaymentCreate):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
        
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        # Concurrency lock
        cursor.execute("SELECT * FROM Orders WHERE OrderID = %s FOR UPDATE", (payment.OrderID,))
        
        # Insert payment
        query_insert = """
            INSERT INTO Payment (PaymentID, OrderID, Amount, PaymentDate, Status)
            VALUES (%s, %s, %s, CURDATE(), 'SUCCESS')
        """
        cursor.execute(query_insert, (payment.PaymentID, payment.OrderID, payment.Amount))
        
        # Savepoint
        cursor.execute("SAVEPOINT after_payment")
        
        # Update order status
        query_update = "UPDATE Orders SET Status = 'PAID' WHERE OrderID = %s"
        cursor.execute(query_update, (payment.OrderID,))
        
        conn.commit()
        return {"message": "Payment successful", "PaymentID": payment.PaymentID}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
