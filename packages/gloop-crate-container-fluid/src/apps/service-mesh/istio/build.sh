set -eux
cd /builder/src/istio
mkdir -p /builder/istio/bin
bash -c "source ~/.bashrc && {{ .GoBuild }} -o /builder/istio/bin/istioctl ./istioctl/cmd/istioctl "
bash -c "source ~/.bashrc && {{ .GoBuild }} -o /builder/istio/bin/istio-operator ./operator/cmd/operator"
bash -c "source ~/.bashrc && {{ .GoBuild }} -o /builder/istio/bin/pilot-discovery ./pilot/cmd/pilot-discovery"
bash -c "source ~/.bashrc && {{ .GoBuild }} -tags agent -o /builder/istio/bin/pilot-agent ./pilot/cmd/pilot-agent"
bash -c "source ~/.bashrc && {{ .GoBuild }} -o /builder/istio/bin/bug-report ./tools/bug-report"
bash -c "source ~/.bashrc && {{ .GoBuild }} -o /builder/istio/bin/echo-client ./pkg/test/echo/cmd/client"
bash -c "source ~/.bashrc && {{ .GoBuild }} -o /builder/istio/bin/echo-server ./pkg/test/echo/cmd/server"
bash -c "source ~/.bashrc && {{ .GoBuild }} -o /builder/istio/bin/extauthz ./samples/extauthz/cmd/extauthz"
cd /builder/src
[ ! -d "proxy" ] && git clone --depth=1 https://github.com/istio/proxy
cd proxy
git fetch --all --tags
git checkout {{ .Versions.Istio }}
cd /builder/src/proxy
sed -i 's|ENVOY_SHA256\s*=\s*".*"$|ENVOY_SHA256 = ""|g' WORKSPACE
which apk && CORRETTO_VERSION="$(echo {{ .Versions.Jdk }} | sed "s|corretto-|corretto-musl-|")" && export JAVA_HOME="/builder/.asdf/installs/java/${CORRETTO_VERSION}"
which apk || export JAVA_HOME="/builder/.asdf/installs/java/{{ .Versions.Jdk }}"
bash -c 'source ~/.bashrc && JAVA_HOME="/builder/.asdf/installs/java/{{ .Versions.Jdk }}" ~/go/bin/bazelisk build --config=libc++ --stamp --config=release //:envoy_tar //:envoy.dwp'
