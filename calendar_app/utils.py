from http import HTTPStatus
from rest_framework.response import Response
from typing import Literal, Optional

def handle_response(
        status_code: HTTPStatus,
        status: Literal["Success", "Failed"],
        message: str = "",
        error: str = "",
        response: Optional[str] = None,
        stack_trace: Optional[Exception] = None
):

    response_payload = {
        "status": status,
        "message": message,
        "error": error,
        "response": response
    }

    headers = {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Credentials": "true" 
    }

    if stack_trace:
        response_payload["stack_trace"] = str(stack_trace)

    response = Response(response_payload, status=status_code, headers=headers)

    return response
