from app.services.llm_service import generate_structured_content
from pydantic import BaseModel

class TestModel(BaseModel):
    message: str

try:
    res = generate_structured_content('say hello', TestModel)
    print("SUCCESS:", res)
except Exception as e:
    print("ERROR:", e)
