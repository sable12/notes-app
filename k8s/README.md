# Running Pinboard on Kubernetes (Rancher Desktop)

These manifests deploy the same app as `docker-compose.yml`, but onto the k3s
cluster bundled with Rancher Desktop, in a `notes-app` namespace.

## 0. Enable Kubernetes in Rancher Desktop

Rancher Desktop → Preferences → Kubernetes → **Enable Kubernetes** (pick any
recent stable version). Also confirm, under Container Engine, that
**dockerd (moby)** is selected — that's what lets images you build with
`docker build` be seen directly by the bundled k3s cluster, with no registry
push/pull needed.

Point kubectl at the right cluster:

```bash
kubectl config use-context rancher-desktop
kubectl get nodes            # sanity check
```

## 1. Build the images locally

From the `notes-app` folder:

```bash
docker build -t notes-backend:local ./backend
docker build -t notes-frontend:local ./frontend
```

The manifests reference these exact tags with `imagePullPolicy: IfNotPresent`,
so k3s will use the local image instead of trying to pull from a registry.

> **If pods get stuck in `ErrImageNeverPull` / `ImagePullBackOff`:** your
> images aren't visible to k3s's containerd (this can happen if the
> container engine is set to plain `containerd` instead of `dockerd (moby)`,
> or after certain Rancher Desktop resets). Fix by importing them directly:
> ```bash
> docker save notes-backend:local | rdctl shell sudo k3s ctr images import -
> docker save notes-frontend:local | rdctl shell sudo k3s ctr images import -
> ```

## 2. Deploy

```bash
kubectl apply -f k8s/
```

This creates, in order: the `notes-app` namespace, Postgres credentials
(Secret) and shared config (ConfigMap), the Postgres PVC + Deployment +
Service, then the backend and frontend Deployments + Services.

## 3. Watch it come up

```bash
kubectl get pods -n notes-app -w
```

Wait for all three pods (`db`, `backend`, `frontend`) to show `Running` /
`1/1 Ready`. The backend won't go ready until it can reach Postgres, and its
readiness probe hits `/api/notes`, so give it ~20-30s after the db pod is
ready.

## 4. Open the app

The frontend Service is a NodePort on **30080**:

```
http://localhost:30080
```

(Rancher Desktop forwards NodePorts from the k3s VM to `localhost`
automatically.) The frontend's nginx proxies `/api/*` to the `backend`
Service inside the cluster, so the browser only ever talks to port 30080.

## Updating after a code change

Rebuild the image, then force the Deployment to pick it up (since the tag
`:local` doesn't change, Kubernetes won't redeploy on its own):

```bash
docker build -t notes-backend:local ./backend
kubectl rollout restart deployment/backend -n notes-app
```

(swap `backend`/`./backend` for `frontend`/`./frontend` as needed)

## Cleaning up

```bash
kubectl delete namespace notes-app
```

This deletes everything, including the Postgres PVC (i.e. your notes).

## Manifest overview

| File | Kind | Purpose |
|---|---|---|
| `00-namespace.yaml` | Namespace | isolates everything under `notes-app` |
| `01-postgres-secret.yaml` | Secret | DB name/user/password, shared by db + backend |
| `02-app-config.yaml` | ConfigMap | DB host/port, CORS origin |
| `03-postgres-pvc.yaml` | PersistentVolumeClaim | 1Gi storage for Postgres data |
| `04-postgres-deployment.yaml` | Deployment | Postgres 16, single replica (`Recreate` strategy, since the PVC is RWO) |
| `05-postgres-service.yaml` | Service (ClusterIP) | internal DNS name `db` |
| `06-backend-deployment.yaml` | Deployment | Spring Boot API |
| `07-backend-service.yaml` | Service (ClusterIP) | internal DNS name `backend` |
| `08-frontend-deployment.yaml` | Deployment | nginx + built React app |
| `09-frontend-service.yaml` | Service (NodePort) | exposes the app on `localhost:30080` |

## Notes / things to change for anything beyond local dev

- Secrets are plaintext here (`stringData`) for simplicity — use a real
  secrets manager (Sealed Secrets, External Secrets, Vault, etc.) before this
  goes anywhere shared.
- `ddl-auto: update` on the backend auto-migrates the schema — fine for a
  single dev replica, not safe once you scale the backend beyond 1 replica
  or run this against a real database. Switch to Flyway/Liquibase first.
- No `Ingress`/TLS here — NodePort is the simplest thing that works locally.
  For anything internet-facing you'd want an Ingress controller instead.
- `backend` runs a single replica because there's no reason to scale it yet;
  it's stateless, so bumping `replicas` is safe once you do need to.
