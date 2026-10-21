(ns valderrama.test-runner
  (:require [clojure.test :as test]
            [valderrama.calculator-test]
            [valderrama.handler-test]))

(defn -main [& _]
  (let [{:keys [fail error]} (test/run-tests 'valderrama.calculator-test 'valderrama.handler-test)]
    (shutdown-agents)
    (System/exit (if (zero? (+ fail error)) 0 1))))
