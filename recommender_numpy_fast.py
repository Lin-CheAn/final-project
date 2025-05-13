import pandas as pd
import numpy as np
import time

class SpotifyRecommender:
    def __init__(self, file_path):
        self.data = pd.read_csv(file_path)
        self.features = [
            'danceability', 'energy', 'key', 'loudness', 'mode',
            'speechiness', 'acousticness', 'instrumentalness',
            'liveness', 'valence', 'tempo'
        ]
        self.feature_matrix = self.data[self.features].values
        self.track_ids = self.data['track_id'].values
        self.track_map = {
            row['track_id']: row for _, row in self.data.iterrows()
        }
        self.id_to_index = {tid: idx for idx, tid in enumerate(self.track_ids)}

    def recommend(self, ratings_dict, top_n=10):
        start_time = time.time()

        liked_ids = [tid for tid, rating in ratings_dict.items() if rating >= 4]
        if not liked_ids:
            return []

        liked_indices = [self.id_to_index[tid] for tid in liked_ids if tid in self.id_to_index]
        liked_vectors = self.feature_matrix[liked_indices]

        # 使用平均向量當作使用者偏好向量
        user_vector = np.mean(liked_vectors, axis=0)

        # 建立 mask 過濾掉已評分過的
        mask = np.isin(self.track_ids, list(ratings_dict.keys()), invert=True)
        candidates = self.feature_matrix[mask]
        candidate_ids = self.track_ids[mask]

        # 計算相似度（1 - mean absolute diff）
        diffs = np.abs(candidates - user_vector)
        scores = 1 - diffs.mean(axis=1)

        # 取 top_n
        top_indices = np.argsort(scores)[-top_n:][::-1]
        top_ids = candidate_ids[top_indices]

        end_time = time.time()
        print(f"⏱️ 推薦完成：耗時 {end_time - start_time:.3f} 秒")

        return [
            {
                "track_id": tid,
                "track_name": self.track_map[tid]["track_name"],
                "artist_name": self.track_map[tid]["artist_name"],
                "spotify_url": f"https://open.spotify.com/track/{tid}"
            }
            for tid in top_ids
        ]

    def get_sample_tracks(self, n=20):
        sampled = self.data.sample(n).copy()
        return [
            {
                "id": row["track_id"],
                "name": row["track_name"],
                "artist": row["artist_name"],
                "spotify_url": f"https://open.spotify.com/track/{row['track_id']}"
            }
            for _, row in sampled.iterrows()
        ]