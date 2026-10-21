"""Verifica a aplicação real (API e frontend), sem dependências externas.

python3 scripts/smoke_test.py --base-url http://127.0.0.1:8080
"""
import argparse
import json
import math
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import urlopen


def get(base, path, expected_status=200):
    try:
        response = urlopen(base + path, timeout=15)
    except HTTPError as error:
        response = error
    with response:
        assert response.status == expected_status, (path, response.status)
        raw = response.read().decode()
        if path.startswith('/api/'):
            assert response.headers.get_content_type() == 'application/json'
            return json.loads(raw)
        return raw


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://127.0.0.1:8080')
    base = parser.parse_args().base_url.rstrip('/')
    assert 'Calculadora de Trastes' in get(base, '/')
    assert get(base, '/api/health') == {'status': 'ok'}
    fixture = json.loads((Path(__file__).resolve().parents[1] / 'backend/test/fixtures/trastes-650.json').read_text())
    result = get(base, '/api/trastes?escala=650')
    assert result['quantidade_trastes'] == len(result['trastes']) == 24
    for expected, actual in zip(fixture['trastes'], result['trastes'], strict=True):
        assert expected['numero'] == actual['numero']
        for field in ['espacamento_mm', 'distancia_ponte_mm', 'distancia_pestana_mm']:
            assert math.isclose(expected[field], actual[field], rel_tol=0, abs_tol=1e-9), (field, actual)
    decimal = get(base, '/api/trastes?escala=648.75')
    assert decimal['escala_mm'] == 648.75
    assert decimal['trastes'][11]['distancia_pestana_mm'] == 324.375
    for query in ['', '?escala=', '?escala=0', '?escala=-1', '?escala=abc', '?escala=NaN', '?escala=Infinity', '?escala=1e309', '?escala=650&escala=700']:
        assert get(base, '/api/trastes' + query, 400)['erro']['codigo'] == 'escala_invalida'
    assert get(base, '/api/inexistente', 404)['erro']['codigo'] == 'rota_nao_encontrada'
    print(f'OK: frontend, healthcheck, 72 medidas de referência, escala decimal e erros HTTP em {base}')


if __name__ == '__main__':
    main()
