(ns valderrama.handler-test
  (:require [cheshire.core :as json]
            [clojure.test :refer [deftest is]]
            [valderrama.calculator :as calculator]
            [valderrama.handler :as handler]))

(defn request [uri query]
  (handler/app {:request-method :get :uri uri :query-string query :headers {}}))

(deftest api-success-test
  (doseq [scale ["650" "648.75"]]
    (let [{:keys [status headers body]} (request "/api/trastes" (str "escala=" scale))
          data (json/parse-string body true)]
      (is (= 200 status))
      (is (re-find #"application/json" (get headers "Content-Type")))
      (is (= (Double/parseDouble scale) (:escala_mm data)))
      (is (= 24 (:quantidade_trastes data) (count (:trastes data))))
      (is (= (set (range 1 25)) (set (map :numero (:trastes data)))))
      (is (= #{:numero :espacamento_mm :distancia_ponte_mm :distancia_pestana_mm}
             (set (keys (first (:trastes data)))))))))

(deftest api-invalid-test
  (doseq [query [nil "" "escala=" "escala=abc" "escala=0" "escala=-650" "escala=NaN"
                 "escala=Infinity" "escala=1e309" "escala=650&escala=700"]]
    (let [{:keys [status body]} (request "/api/trastes" query)]
      (is (= 400 status) (str query))
      (is (= "escala_invalida" (get-in (json/parse-string body true) [:erro :codigo]))))))

(deftest health-and-not-found-test
  (is (= {:status "ok"} (json/parse-string (:body (request "/api/health" nil)) true)))
  (let [response (request "/api/inexistente" nil)]
    (is (= 404 (:status response)))
    (is (= "rota_nao_encontrada" (get-in (json/parse-string (:body response) true) [:erro :codigo])))))

(deftest unexpected-error-test
  (with-redefs [calculator/calculate (fn [_] (throw (ex-info "Detalhe privado" {})))]
    (let [response (request "/api/trastes" "escala=650")]
      (is (= 500 (:status response)))
      (is (= "erro_interno" (get-in (json/parse-string (:body response) true) [:erro :codigo])))
      (is (not (re-find #"Detalhe privado" (:body response)))))))
