import pandas as pd
import numpy as np

class SpotifyRecommender:
    def __init__(self, file_path):
        self.data = pd.read_csv(file_path)
        self.features = [
            'danceability', 'energy', 'key', 'loudness', 'mode',
            'speechiness', 'acousticness', 'instrumentalness',
            'liveness', 'valence', 'tempo'
        ]
        # 建立 track_id 快取字典（查找效率大幅提升）
        self.track_dict = {
            row['track_id']: row for _, row in self.data.iterrows()
        }

    def fuzzy_similarity(self, track1, track2):
        a = track1[self.features].values
        b = track2[self.features].values
        return 1 - np.abs(a - b).mean()

    def recommendation_score(self, track, liked_tracks):
        if not liked_tracks:
            return 0
        scores = [
            self.fuzzy_similarity(track, liked['track'])
            for liked in liked_tracks
        ]
        return np.mean(scores)

    def fcb_rs(self, ratings, top_n=10):
        # 取得使用者評分過的歌曲
        liked_tracks = [
            {'track_id': track_id, 'rating': rating, 'track': self.track_dict[track_id]}
            for track_id, rating in ratings.items() if rating >= 4
        ]
        if not liked_tracks:
            return []

        # 篩選未評分歌曲
        rated_ids = set(ratings.keys())
        unrated_tracks = self.data[~self.data['track_id'].isin(rated_ids)]

        # 評分每首未評分的歌
        scores = []
        for _, track in unrated_tracks.iterrows():
            score = self.recommendation_score(track, liked_tracks)
            scores.append((track, score))

        # 按分數排序
        scores.sort(key=lambda x: x[1], reverse=True)
        results = [s[0] for s in scores[:top_n]]
        return results

    def recommend(self, ratings_dict, top_n=10):
        results = self.fcb_rs(ratings_dict, top_n=top_n)
        return [
            {
                "track_id": r["track_id"],
                "track_name": r["track_name"],
                "artist_name": r["artist_name"],
                "spotify_url": f"https://open.spotify.com/track/{r['track_id']}"
            }
            for r in results
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