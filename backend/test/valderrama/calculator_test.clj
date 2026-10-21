(ns valderrama.calculator-test
  (:require [cheshire.core :as json]
            [clojure.java.io :as io]
            [clojure.test :refer [deftest is testing]]
            [valderrama.calculator :as calculator]
            [valderrama.validation :as validation]))

(defn close? [expected actual]
  (< (Math/abs (- expected actual)) 1.0e-9))

(deftest spreadsheet-reference-test
  (let [expected (json/parse-string (slurp (io/resource "fixtures/trastes-650.json")) true)
        actual (calculator/calculate 650)]
    (is (= 24 (:quantidade_trastes actual) (count (:trastes actual))))
    (doseq [[reference fret] (map vector (:trastes expected) (:trastes actual))]
      (testing (str "Traste " (:numero reference))
        (is (= (:numero reference) (:numero fret)))
        (doseq [field [:espacamento_mm :distancia_ponte_mm :distancia_pestana_mm]]
          (is (close? (field reference) (field fret)) (name field)))))))

(deftest known-distances-test
  (let [frets (:trastes (calculator/calculate 650))]
    (is (close? 36.48169675689925 (:distancia_pestana_mm (first frets))))
    (is (close? 70.91583320877948 (:distancia_pestana_mm (second frets))))
    (is (close? 34.43413645188023 (:espacamento_mm (second frets))))
    (is (= 325.0 (:distancia_pestana_mm (nth frets 11))))
    (is (= 487.5 (:distancia_pestana_mm (last frets))))))

(deftest physical-properties-test
  (doseq [scale [350.0 648.75 650.0 864.0]]
    (let [frets (:trastes (calculator/calculate scale))]
      (is (apply < (map :distancia_pestana_mm frets)))
      (is (apply > (map :espacamento_mm frets)))
      (is (every? pos? (map :espacamento_mm frets)))
      (is (= (/ scale 2) (:distancia_pestana_mm (nth frets 11))))
      (is (close? (:distancia_pestana_mm (last frets)) (reduce + (map :espacamento_mm frets))))
      (doseq [fret frets]
        (is (close? scale (+ (:distancia_ponte_mm fret) (:distancia_pestana_mm fret)))))))
  (doseq [[a b] (map vector (:trastes (calculator/calculate 650)) (:trastes (calculator/calculate 1300)))
          field [:distancia_pestana_mm :distancia_ponte_mm :espacamento_mm]]
    (is (close? (* 2 (field a)) (field b)))))

(deftest validation-test
  (doseq [invalid [nil "" " " "abc" "650mm" "0" "-1" "NaN" "Infinity" "1e309" "1e-999" "650,5" "0x1p2" ["650" "700"]]]
    (is (nil? (validation/parse-scale invalid)) (pr-str invalid)))
  (doseq [[input expected] [["650" 650.0] ["648.75" 648.75] [" 650 " 650.0] [".5" 0.5] ["6.5e2" 650.0]]]
    (is (= expected (validation/parse-scale input)))))
