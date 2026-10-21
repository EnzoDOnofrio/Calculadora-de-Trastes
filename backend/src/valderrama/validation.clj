(ns valderrama.validation
  (:require [clojure.string :as str]))

(defn parse-scale
  "Converte um único parâmetro decimal, rejeitando valores não finitos e não positivos."
  [value]
  (when (string? value)
    (let [text (str/trim value)]
      (when (re-matches #"[+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?" text)
        (try
          (let [number (Double/parseDouble text)]
            (when (and (Double/isFinite number) (pos? number)) number))
          (catch NumberFormatException _ nil))))))
