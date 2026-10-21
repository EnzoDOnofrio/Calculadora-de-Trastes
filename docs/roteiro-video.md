# Roteiro do vídeo de demonstração

Duração sugerida: **4 a 6 minutos**. Gravar tela e narração. Preencher nomes e RAs dos integrantes no README antes da entrega. Este arquivo é o roteiro; a gravação deve ser produzida pelo grupo.

## Preparação

Na raiz, executar `docker compose up --build -d` e conferir `docker compose ps`. Abrir `http://127.0.0.1:8080` no navegador. Deixar um terminal disponível para demonstrar a API e os testes. Usar zoom legível e evitar mostrar dados pessoais de outras abas ou aplicativos.

## 1. Apresentação — aproximadamente 30 segundos

Apresentar integrantes, disciplina, instituição e empresa parceira Valderrama Luthier.

Sugestão de narração: “Desenvolvemos uma calculadora de trastes para músicos, estudantes e luthiers. A interface foi feita em React com JavaScript, e o cálculo é realizado por uma API REST em Clojure.”

## 2. Cálculo e leitura das medidas — aproximadamente 90 segundos

1. Explicar que escala é a distância entre pestana e ponte, em milímetros.
2. Manter `650` no campo e clicar em **Calcular trastes**.
3. Mostrar a tabela com os 24 trastes e explicar as três medidas.
4. Conferir o primeiro traste: 36,48 mm da pestana e 613,52 mm da ponte.
5. Mostrar o 12º traste: 325,00 mm da pestana e 325,00 mm da ponte, metade da escala.
6. Selecionar o segundo traste na tabela e mostrar o destaque no desenho.
7. Selecionar um traste no desenho e navegar com as setas do teclado.
8. Explicar que o desenho é ilustrativo e não um gabarito em tamanho real.

## 3. Validação e escala decimal — aproximadamente 45 segundos

1. Alterar a entrada para `648,75`; antes de calcular, mostrar o aviso de resultados anteriores.
2. Calcular e conferir 324,38 mm apresentados na posição do 12º traste.
3. Enviar `0` e depois um texto: mostrar o erro sem aceitar um cálculo inválido.
4. Retornar a `650` e recalcular.
5. Reduzir a largura da janela ou usar o modo responsivo do navegador para mostrar o layout de celular e a rolagem da tabela.

## 4. API REST em JSON — aproximadamente 45 segundos

No terminal, executar:

```sh
curl -i 'http://127.0.0.1:8080/api/health'
curl -i 'http://127.0.0.1:8080/api/trastes?escala=650'
curl -i 'http://127.0.0.1:8080/api/trastes?escala=0'
```

Mostrar HTTP `200`, campos da resposta, 24 itens e HTTP `400` para entrada inválida. Destacar que o JavaScript recebe o cálculo pronto do backend.

## 5. Código funcional e verificação — aproximadamente 60 segundos

1. Mostrar `backend/src/valderrama/calculator.clj`: função pura, fórmula temperada, `mapv` e coleção imutável de resultados.
2. Explicar a separação entre cálculo, validação, HTTP e servidor.
3. Explicar que os resultados da API mantêm a precisão e que só a interface arredonda. Mostrar o espaçamento correto do segundo traste: 34,43 mm.
4. Executar os testes do backend em Docker:

```sh
docker compose exec backend clojure -M:test
```

5. Mostrar o resultado com zero falhas. O teste de erro interno gera um log de exceção esperado.
6. Se houver tempo, mostrar `npm test` em `frontend/` e a origem dos valores de referência na planilha.

## 6. Encerramento — aproximadamente 20 segundos

Mostrar o README com instalação, arquitetura, endpoints e referências. Apontar como melhorias futuras a integração ao site do parceiro e a exportação das medidas.

## Checklist antes de entregar

- Identificar todos os integrantes e RAs no README e na apresentação.
- Conferir que o vídeo mostra a aplicação funcionando, o retorno JSON e pelo menos uma entrada inválida.
- Garantir que texto, números e terminal estejam legíveis.
- Entregar o link ou arquivo de vídeo no formato solicitado pelo professor.
- Conferir os requisitos e a data de entrega nos materiais da disciplina.
