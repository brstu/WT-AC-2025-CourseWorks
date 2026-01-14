# Kubernetes Deployment Testing

## Prerequisites

- kubectl с поддержкой `-k` (kustomize)
- Доступ к кластеру (minikube/kind/облако)
- nginx ingress controller установлен
- Образы `group-organizer-server` и `group-organizer-web` доступны в registry

## Применение манифестов

### Development окружение

```bash
# Применить dev манифесты
kubectl apply -k k8s/overlays/dev

# Проверить статус
kubectl get pods,svc,ingress -n app-dev

# Просмотр логов
kubectl logs -f deployment/dev-server -n app-dev

# Удалить
kubectl delete -k k8s/overlays/dev
```

### Production окружение

```bash
# Создать secrets (скопировать из secrets.example.yaml и заполнить)
kubectl apply -f k8s/overlays/prod/secrets.yaml -n app-prod

# Применить prod манифесты
kubectl apply -k k8s/overlays/prod

# Проверить статус
kubectl get pods,svc,ingress -n app-prod

# Удалить
kubectl delete -k k8s/overlays/prod
```

## Настройка Ingress

Обновите хосты в патчах:
- Dev: `k8s/overlays/dev/patches/ingress-host.yaml`
- Prod: `k8s/overlays/prod/patches/ingress-host.yaml`

Для TLS раскомментируйте блок `tls` в `k8s/base/ingress.yaml` и настройте cert-manager.

## Troubleshooting

```bash
# Описание пода
kubectl describe pod <pod-name> -n <namespace>

# Логи пода
kubectl logs -f <pod-name> -n <namespace>

# Проверка событий
kubectl get events -n <namespace> --sort-by='.lastTimestamp'

# Проверка ingress
kubectl get ingress -n <namespace>
kubectl describe ingress app-ingress -n <namespace>
```
