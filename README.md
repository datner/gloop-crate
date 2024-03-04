# Gloop Crate

Drips or floods with Dockerfiles, following the most recent best practices in supply chain hardening and container image optimizations.

## Status: In early development stages

Containers depend on other containers, a certain pipeline generator is a must for versioning consistency and image delivery pipeline hardening.
There are numerous ways to perform container builds, but most build practices are not distributed evenly.

Most, so called, "of the shelf" experiences are rather lacking in support and flexibility, GloopCrate standardizes Dockerfile structure, resulting in reproducible, hardened container image builds.

## Usage

```bash
# WIP atm

yarn install @crate-monster/gloop-crate-cli
gloop keda                # gives you a keda Dockerfile
gloop search spark        # searches for spark related Dockerfiles
gloop tektoncd            # generates universal TektonCD pipelines for all the available images
gloop tektoncd keda       # generates a TektonCD pipeline for keda image
gloop github-actions
gloop github-actions keda

go install github.com/crate-monster/gloop-crate/packages/libdiscovery
libdiscovery node:21 /usr/local/bin/node
```

## Support

Gloop Crate project, derived images, and dockerfiles do not imply, in any shape or form, that Red Hat / Oracle / VMware support or endorse their usage.

The author of Gloop Crate project [Yuriy Yarosh](mailto:yuriy@yarosh.dev) does provide limited commercial support for the provided Dockerfiles, container images, and supply chain audit.

### Linux base distributions

 - [Red Hat UBI](https://catalog.redhat.com/software/base-images) all things Red Hat
 - [Debian](https://www.debian.org) just because it's stable
 - [PhotonOS](https://vmware.github.io/photon/) just because it's fairly decent
 - [Rocky](https://rockylinux.org/) as a CentOS replacement
 - [Oracle](https://www.oracle.com/linux/) all things Oracle
 - [Alpine](https://www.alpinelinux.org/) just because someone might want [musl](https://musl.libc.org/)

### Programming Languages
 
 - [Python3](https://www.python.org/) to build Node and run ML notebooks 
 - [Node](https://nodejs.org) to build frontend apps
 - [Rust](https://www.rust-lang.org/) to build something reliable and efficient
 - [Golang](https://go.dev) to build something convenient
 - [Ruby](https://www.ruby-lang.org) for everything else
 - [JDK21](https://openjdk.org/projects/jdk/21/) to build JVM apps
 - [OpenJ9](https://eclipse.dev/openj9/) to build compact containerized JVM apps
 - [GraalVM CE](https://github.com/oracle/graal/) to build memory efficient JVM apps
 - [GraalPy](https://github.com/oracle/graalpython) to build memory/compute efficient Python
 - [TruffleRuby](https://github.com/oracle/truffleruby) to build memory/compute efficient Ruby

### Best Practices

 - [x] Advanced layer caching
 - [x] Forced layer cache invalidation and automatic advisory updates
 - [x] Multi-distro [distroless](https://github.com/GoogleContainerTools/distroless) images 
 - [x] CI build pipeline generation for dependent containers
 - [ ] [in-toto](https://in-toto.io/) attestation and sigstore keyless signing support
 - [ ] [GitSign](https://github.com/sigstore/gitsign) support
 - [ ] [Unikraft](https://unikraft.org/) images
 - [ ] [FIPS](https://csrc.nist.gov/pubs/fips/140-2/upd2/final) support

## Dockerfiles

GloopCrate generates dockerfiles for

 - [Artifacts](./packages/gloop-crate-container-fluid/src/apps/artifacts): [Dragonfly](https://d7y.io/), [Harbor](https://goharbor.io/), [reposilite](https://reposilite.com/), [verdaccio](https://verdaccio.org/)
 - [Autoscaling](./packages/gloop-crate-container-fluid/src/apps/autoscaling): [addon-resizer](https://github.com/kubernetes/autoscaler/tree/master/addon-resizer), [cluster-autoscaler](https://github.com/kubernetes/autoscaler), [descheduler](https://github.com/kubernetes-sigs/descheduler), [keda](https://keda.sh/), [vpa](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler)
 - [Backups](./packages/gloop-crate-container-fluid/src/apps/backups): [Velero](https://velero.io/)
 - [Budgets](./packages/gloop-crate-container-fluid/src/apps/budgets): [InfraCost](https://www.infracost.io/), [OpenCost](https://www.opencost.io/)
 - [CDN](./packages/gloop-crate-container-fluid/src/apps/cdn): TBD
 - [Chaos](./packages/gloop-crate-container-fluid/src/apps/chaos): [ChaosMesh](https://chaos-mesh.org/), [Litmus](https://www.litmus.com/)
 - [Communications](./packages/gloop-crate-container-fluid/src/apps/chaos): [RocketChat](https://www.rocket.chat/)
 - [Connectivity](./packages/gloop-crate-container-fluid/src/apps/connectivity): [Cilium](https://cilium.io/), [MetalLB](https://metallb.universe.tf/), [MirrorD](https://github.com/metalbear-co/mirrord)
 - [Databases](./packages/gloop-crate-container-fluid/src/apps/database): [CNPG](https://cloudnative-pg.io/), [MongoDB](https://www.mongodb.com/), [ScyllaDB](https://www.scylladb.com/)
 - [Delivery](./packages/gloop-crate-container-fluid/src/apps/delivery): [ArgoCD](https://argo-cd.readthedocs.io/en/stable/), [Argo Rollouts](https://argo-rollouts.readthedocs.io/en/stable/), [Argo Events](https://argoproj.github.io/argo-events/)
 - [Development](./packages/gloop-crate-container-fluid/src/apps/development): [OpenVSCode Server](https://github.com/gitpod-io/openvscode-server)
 - [Domains](./packages/gloop-crate-container-fluid/src/apps/domains): [Cluster DNS Operator](https://github.com/openshift/cluster-dns-operator), [CoreDNS](https://coredns.io/)
 - [Event Sourcing](./packages/gloop-crate-container-fluid/src/apps/event-sourcing): [Nats](https://nats.io/), [RabbitMQ](https://www.rabbitmq.com/), [RedPanda](https://redpanda.com/), [Strimzi](https://strimzi.io/)
 - [Extract Transform Load](./packages/gloop-crate-container-fluid/src/apps/extract-transform-load): [Spark Operator](https://github.com/GoogleCloudPlatform/spark-on-k8s-operator)
 - [Git](./packages/gloop-crate-container-fluid/src/apps/git): [Gitea](https://about.gitea.com/), [Gitlab](https://about.gitlab.com/)
 - [Infrastructure & Orchestration](./packages/gloop-crate-container-fluid/src/apps/infra): [Open Tofu](https://opentofu.org/), [Atlantis](https://www.runatlantis.io/), [Kubernetes](https://kubernetes.io/)
 - [ITSM](./packages/gloop-crate-container-fluid/src/apps/itsm): [Oncall](https://grafana.com/products/cloud/oncall/)
 - [Machine Learning](./packages/gloop-crate-container-fluid/src/apps/machine-learning): [Nvidia Triton](https://developer.nvidia.com/triton-inference-server), [Nvidia Merlin](https://developer.nvidia.com/merlin), [Onnx Runtime](https://onnxruntime.ai/) 
 - [Mail](./packages/gloop-crate-container-fluid/src/apps/mail): TBD
 - [Observability](./packages/gloop-crate-container-fluid/src/apps/observability): [Grafana Labs Stack](https://grafana.com/oss/), [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics), [node-exporter](https://github.com/prometheus/node_exporter), [vector](https://vector.dev/)
 - [Secrets](./packages/gloop-crate-container-fluid/src/apps/secrets): [cert-manager](https://cert-manager.io/), [external-secrets-operator](https://external-secrets.io/latest/)
 - [Security](./packages/gloop-crate-container-fluid/src/apps/security): [Falco](https://falco.org/), [Kube Armor](https://kubearmor.io/), [Kyverno](https://kyverno.io/), [Kube Hunter](https://github.com/aquasecurity/kube-hunter), [Kube Bench](https://github.com/aquasecurity/kube-bench)
 - [Serverless](./packages/gloop-crate-container-fluid/src/apps/serverless): [Knative](https://knative.dev/docs/), [OpenFaas](https://www.openfaas.com/)
 - [Service Mesh](./packages/gloop-crate-container-fluid/src/apps/service-mesh): [istio](https://istio.io/), [Linkerd2](https://github.com/linkerd/linkerd2)
 - [Storage](./packages/gloop-crate-container-fluid/src/apps/storage): [minio](https://min.io/), [rook](https://rook.io/)

## Design

Dockerfiles are a bit hard to get right. While distroless bazel usage hurts distroless adoption a bit, nothing really prevent us from porting it to plain Dockerfiles.

Gloop Crate can't rely on the existing Image tags Implementation for stable Artifact Versioning, without Build Timestamps and gitsign / in-toto attestations signing.

## Development

## Terms of Use

By using this project for both academic, advertisement, enterprise, and any other profit or non-profit purpose, you grant **Your Implicit Agreement** to the following:

 - You condemn the Russian State and Russian People for directly or indirectly supporting the act of unlawful invasion into the Sovereign State of Ukraine, for genocide of Ukrainian People, and other forms of Ethnic Cleansing 
 - You condemn every Russian State supporting individual and legal entity who had put the Interests of the Russian State above The Definition of Freedom and Independent Democracy
 - You agree that Russia is a Terrorist State and the Major Source of Corruption Worldwide
 - You support the territorial integrity of Georgia and Ukraine, including claims over occupied territories of Crimea, Donbas, Abkhazia and South Ossetia
 - You reject the False Narratives, False Historical Claims, and any other Bold and Arrogant Lie perpetuated by the Russian State propaganda
 
### License

As per Oracle Linux License agreement [Trademark usage restriction](https://github.com/oracle/container-images/blob/main/LICENSE.txt#L61) Oracle Linux derived works were named and identified as **notora**, to prevent any possible Trademark Usage Violation.

Dockerfiles and Images derived from Oracle Linux Base Images usage and distribution **MUST** conform the terms of [Oracle Linux License Agreement](https://raw.githubusercontent.com/oracle/container-images/main/LICENSE.txt).
Dockerfiles and Images derived from PhotonOS Base Images usage and distribution **MUST** conform the terms of [PhotonOS End User License Agreement](https://raw.githubusercontent.com/vmware/photon/master/EULA.txt).
Dockerfiles and Images derived from RedHat Universal Base Images (UBI) usage and distribution **MUST** conform the terms of RedHat [UBI End User License Agreement](https://www.redhat.com/licenses/EULA_Red_Hat_Universal_Base_Image_English_20190422.pdf).

Gloop Create is licensed under the terms of [Mozilla Public License](LICENSE) Version 2.0 with no copyleft exception ([MPL-2.0-no-copyleft-exception](https://spdx.org/licenses/MPL-2.0-no-copyleft-exception.html)).

Title to the Programs and any component shall remain with their own respective licensors, and is a subject to the applicable licenses.
