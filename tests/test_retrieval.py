import unittest

import numpy as np

from flyrec.retrieval import exact_neighbors, topk_from_scores


class NeighbourTruthTest(unittest.TestCase):
    def test_continuous_scores_are_not_reordered_by_tie_breaking(self):
        scores = np.array([[0.9, 0.8001, 0.8, 0.1]], dtype=np.float32)
        for seed in range(10):
            self.assertEqual(topk_from_scores(scores, 2, seed=seed).tolist(), [[0, 1]])

    def test_exact_neighbors_excludes_query(self):
        emb = np.eye(3, dtype=np.float32)
        self.assertEqual(set(exact_neighbors(emb, np.array([0]), k=2)[0]), {1, 2})


if __name__ == "__main__":
    unittest.main()
