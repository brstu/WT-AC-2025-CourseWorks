# Kubernetes manifests for the Books app

Prerequisites

- A Kubernetes cluster (minikube, kind, k3s, or cloud).
- `kubectl` configured to talk to the cluster.
- A built and available image for the app. By default manifests reference `books:latest`.

Quick start (local cluster using `kind`)

1.Build the image locally and load it into `kind` (if using kind):

```bash
docker build -t books:latest .
kind load docker-image books:latest
```

2.Apply manifests:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -n books-app -f k8s/postgres-secret.yaml -f k8s/postgres-pvc.yaml -f k8s/postgres-deployment.yaml -f k8s/postgres-service.yaml
kubectl apply -n books-app -f k8s/app-deployment.yaml -f k8s/app-service.yaml
# Optional: apply Ingress (requires controller)
kubectl apply -n books-app -f k8s/ingress.yaml
```

Notes

- If you push the image to a registry, update `k8s/app-deployment.yaml` to point to your registry image (for example `ghcr.io/<owner>/books:latest`) and set appropriate `imagePullSecrets` if private.
- The `postgres-secret.yaml` in this example stores DB credentials in a Secret as plain values for convenience — rotate and secure in production.
- The manifests are minimal examples; adjust replicas, resources, probes, and storage according to your environment.
