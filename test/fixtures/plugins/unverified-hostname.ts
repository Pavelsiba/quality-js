import tls from "node:tls"

tls.connect({ host: "a", checkServerIdentity: () => undefined }) // ловит
tls.connect({ host: "a", checkServerIdentity: () => {} }) // ловит
tls.connect({ host: "a", checkServerIdentity: (_host, _cert) => undefined }) // ловит
tls.connect({ host: "a", checkServerIdentity: function () {} }) // ловит
tls.connect({ host: "a", checkServerIdentity: (host, cert) => tls.checkServerIdentity(host, cert) })
tls.connect({ host: "a" })
