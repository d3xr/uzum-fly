"""Инварианты перестановки FlyWire-контроля на реальном коннектоме."""

from pathlib import Path
import unittest

import numpy as np

from flyrec.mushroom import shuffled


CIRCUIT = Path(__file__).resolve().parents[1] / "data/fly/mb_circuit.npz"


class ShuffledCircuitTest(unittest.TestCase):
    def test_real_circuit_preserves_simple_graph_and_kc_weights(self):
        with np.load(CIRCUIT) as data:
            W = data["W"]

        control = shuffled({"W": W}, seed=7).W
        original_edges = W != 0
        control_edges = control != 0

        np.testing.assert_array_equal(control_edges.sum(axis=0), original_edges.sum(axis=0))
        np.testing.assert_array_equal(control_edges.sum(axis=1), original_edges.sum(axis=1))
        self.assertEqual(np.count_nonzero(control), np.count_nonzero(W))

        # Каждая ячейка матрицы соответствует единственной паре (гломерула, KC).
        # Совпавшие рёбра нельзя скрыть суммированием весов: все исходные веса
        # данной KC должны остаться в точности тем же мультимножеством.
        for kc in range(W.shape[1]):
            np.testing.assert_array_equal(
                np.sort(control[:, kc][control_edges[:, kc]]),
                np.sort(W[:, kc][original_edges[:, kc]]),
            )

        self.assertGreater(np.count_nonzero(original_edges != control_edges), 0)
        np.testing.assert_array_equal(control, shuffled({"W": W}, seed=7).W)


if __name__ == "__main__":
    unittest.main()
