  set -eux
  cd /builder/src
  mkdir -p /builder/linkerd2/usr/bin
  mkdir -p /builder/linkerd2/usr/lib/linkerd
  [ ! -d "linkerd2-proxy" ] && git clone --depth=1 https://github.com/linkerd/linkerd2-proxy
  cd linkerd2-proxy
  git fetch --all --tags
  git checkout release/$(cat ../linkerd2/.proxy-version)
  bash -c "source ~/.bashrc && cargo build --package=linkerd2-proxy --profile release --features \"default multicore\""
  cp target/release/linkerd2-proxy /builder/linkerd2/usr/bin
  cp LICENSE /builder/linkerd2/usr/lib/linkerd
  cp ../linkerd2/.proxy-version /builder/linkerd2/usr/lib/linkerd/linkerd2-proxy-version.txt
  cd ..
  [ ! -d "linkerd-await" ] && git clone --depth=1 {{ .Versions.LinkerdAwaitURL }}
  cd linkerd-await
  git fetch --all --tags
  git checkout release/{{ .Versions.LinkerdAwait }}
  bash -c "source ~/.bashrc && cargo build --profile release"
  cp target/release/linkerd-await /builder/linkerd2/usr/bin
  cd ..
  [ ! -d "linkerd2-proxy-init" ] && git clone --depth=1 {{ .Versions.LinkerdValidatorURL }}
  cd linkerd2-proxy-init
  git fetch --all --tags
  git checkout cni-plugin/{{ .Versions.LinkerdValidator }}
  bash -c "source ~/.bashrc && cargo build --profile release"
  cp target/release/linkerd-network-validator /builder/linkerd2/usr/bin
  cd /builder/src/linkerd2
  bash -c "source ~/.bashrc && go generate -mod=readonly ./pkg/charts/static"
  bash -c "source ~/.bashrc && go generate -mod=readonly ./jaeger/static"
  bash -c "source ~/.bashrc && go generate -mod=readonly ./multicluster/static"
  bash -c "source ~/.bashrc && go generate -mod=readonly ./viz/static"
  bash -c "source ~/.bashrc && go clean -modcache"
  bash -c "source ~/.bashrc && {{ .GoBuild }} ./pkg/..."
  bash -c "source ~/.bashrc && {{ .GoBuild }} -mod=readonly -tags prod -o /builder/linkerd2/usr/bin/proxy-identity ./proxy-identity"
  bash -c "source ~/.bashrc && {{ .GoBuild }} -mod=readonly -tags prod -o /builder/linkerd2/usr/bin/linkerd ./cli"
  bash -c "source ~/.bashrc && {{ .GoBuild }} -mod=readonly -tags prod -o /builder/linkerd2/usr/bin/injector ./jaeger/injector/cmd"
  bash -c "source ~/.bashrc && {{ .GoBuild }} -mod=readonly -tags prod -o /builder/linkerd2/usr/bin/metrics-api ./viz/metrics-api/cmd"
  bash -c "source ~/.bashrc && {{ .GoBuild }} -mod=readonly -tags prod -o /builder/linkerd2/usr/bin/cni-plugin ./cni-plugin"
  bash -c "source ~/.bashrc && {{ .GoBuild }} -mod=readonly -tags prod -o /builder/linkerd2/usr/bin/controller ./controller/cmd"
  bash -c "source ~/.bashrc && {{ .GoBuild }} -mod=readonly -tags prod -o /builder/linkerd2/usr/bin/tap ./viz/tap/cmd"
  bash -c "source ~/.bashrc && cargo build --profile release --package=linkerd-policy-controller"
  mv ./target/release/linkerd-policy-controller /builder/linkerd2/usr/bin
  cp cni-plugin/deployment/scripts/install-cni.sh /builder/linkerd2/usr/bin
  cp cni-plugin/deployment/linkerd-cni.conf.default /builder/linkerd2
  cp cni-plugin/deployment/scripts/filter.jq /builder/linkerd2/usr/bin
  cd /builder/src/linkerd2
  cd web/app
  bash -c "source ~/.bashrc && npm install -g yarn"
  bash -c "source ~/.bashrc && yarn"
  bash -c "source ~/.bashrc && yarn lingui compile"
  bash -c "source ~/.bashrc && yarn webpack"
  cd ../..
  mkdir -p /builder/linkerd2/app
  cp -r web/app/dist /builder/linkerd2/app
  cp -r web/templates /builder/linkerd2/app
  bash -c "source ~/.bashrc && {{ .GoBuild }} -mod=readonly -tags prod -o /builder/linkerd2/usr/bin/web ./web"