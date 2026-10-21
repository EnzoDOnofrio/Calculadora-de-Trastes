(ns valderrama.calculator)

(def fret-count 24)

(defn position
  "Distância à pestana, em mm, sem arredondamento. O traste zero é a pestana."
  [scale fret]
  (* (double scale) (- 1.0 (/ 1.0 (Math/pow 2.0 (/ fret 12.0))))))

(defn calculate
  "Calcula 24 trastes para uma escala já validada, finita e positiva."
  [scale]
  {:escala_mm (double scale)
   :quantidade_trastes fret-count
   :trastes (mapv (fn [n]
                    (let [distance (position scale n)]
                      {:numero n
                       :espacamento_mm (- distance (position scale (dec n)))
                       :distancia_ponte_mm (- scale distance)
                       :distancia_pestana_mm distance}))
                  (range 1 (inc fret-count)))})
