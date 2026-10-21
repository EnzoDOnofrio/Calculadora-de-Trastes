"""Gera referências independentes com Decimal (60 dígitos), a partir da planilha.

Executar com Python 3, sem bibliotecas externas. Não altera a planilha.
"""
import json
from decimal import Decimal, localcontext
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def reference():
    with ZipFile(ROOT / "planilha_trastes_formula_pura.xlsx") as workbook:
        sheet = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))
    cells = {cell.attrib["r"]: cell for cell in sheet.findall(".//s:c", NS)}
    scale = Decimal(cells["D2"].find("s:v", NS).text)
    frets = []
    with localcontext() as context:
        context.prec = 60
        previous = Decimal(0)
        for n in range(1, 25):
            row = n + 4
            assert cells[f"A{row}"].find("s:v", NS).text == str(n)
            assert cells[f"D{row}"].find("s:f", NS).text == f"$D$2*(1-(1/(2^(A{row}/12))))"
            assert cells[f"C{row}"].find("s:f", NS).text == f"$D$2-D{row}"
            assert cells[f"B{row}"].find("s:f", NS).text == (f"D{row}" if n == 1 else f"D{row}-D{row-1}")
            distance = scale * (1 - 1 / context.power(Decimal(2), Decimal(n) / 12))
            frets.append({"numero": n, "espacamento_mm": float(distance - previous),
                          "distancia_ponte_mm": float(scale - distance),
                          "distancia_pestana_mm": float(distance)})
            previous = distance
    return {"escala_mm": float(scale), "quantidade_trastes": 24, "trastes": frets}


if __name__ == "__main__":
    output = ROOT / "backend/test/fixtures/trastes-650.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(reference(), indent=2) + "\n", encoding="utf-8")
    print(f"Referências dos 24 trastes verificadas na planilha: {output}")
