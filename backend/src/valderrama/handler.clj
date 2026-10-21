(ns valderrama.handler
  (:require [compojure.core :refer [ANY GET defroutes]]
            [ring.middleware.json :refer [wrap-json-response]]
            [ring.middleware.params :refer [wrap-params]]
            [valderrama.calculator :as calculator]
            [valderrama.validation :as validation])
  (:import [java.util.logging Level Logger]))

(defn error-response [status code message]
  {:status status :body {:erro {:codigo code :mensagem message}}})

(defn calculate-handler [request]
  (if-let [scale (validation/parse-scale (get-in request [:query-params "escala"]))]
    {:status 200 :body (calculator/calculate scale)}
    (error-response 400 "escala_invalida"
                    "Informe uma escala numérica finita e maior que zero, em milímetros. Use ponto para decimais na API.")))

(defroutes routes
  (GET "/api/health" [] {:status 200 :body {:status "ok"}})
  (GET "/api/trastes" request (calculate-handler request))
  (ANY "*" [] (error-response 404 "rota_nao_encontrada" "Endpoint não encontrado.")))

(defn wrap-errors [handler]
  (fn [request]
    (try
      (handler request)
      (catch Exception exception
        (.log (Logger/getLogger "valderrama.api") Level/SEVERE
              "Falha ao processar requisição" exception)
        (error-response 500 "erro_interno" "Não foi possível calcular agora. Tente novamente.")))))

(def app
  (-> routes wrap-params wrap-errors wrap-json-response))
