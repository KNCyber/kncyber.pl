FROM python:3.9 AS builder

WORKDIR /build

COPY setup.py setup.py
COPY requirements.txt requirements.txt
RUN pip wheel -w wheels .

FROM python:3.9-slim

WORKDIR /usr/src/app

COPY --from=builder /build/wheels /wheels
RUN pip install --no-cache-dir /wheels/*.whl

COPY . .

ENTRYPOINT ["python", "./src/app.py"]
