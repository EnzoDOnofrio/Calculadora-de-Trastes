(ns valderrama.server
  (:require [ring.adapter.jetty :as jetty]
            [valderrama.handler :refer [app]]))

(defn -main [& _]
  (let [port (Integer/parseInt (or (System/getenv "PORT") "3000"))
        host (or (System/getenv "HOST") "127.0.0.1")]
    (when-not (<= 1 port 65535)
      (throw (ex-info "PORT deve estar entre 1 e 65535." {:port port})))
    (let [server (jetty/run-jetty app {:host host :port port :join? false})]
      (.addShutdownHook (Runtime/getRuntime) (Thread. #(.stop server)))
      (println (str "API Valderrama disponível em http://" host ":" port))
      (.join server))))
