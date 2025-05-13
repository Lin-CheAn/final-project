from flask import Flask, request, jsonify, render_template
#from recommender import SpotifyRecommender  # 確保路徑正確
# from recommender import SpotifyRecommender
#from recommender_optimized import SpotifyRecommender
from recommender_numpy_fast import SpotifyRecommender

app = Flask(__name__, static_folder='static', template_folder='templates')
recommender = SpotifyRecommender("music_pool.csv")

@app.route('/')
def home():
    sample_tracks = recommender.get_sample_tracks(20)  # 傳 20 首隨機歌
    return render_template('index.html', tracks=sample_tracks)

@app.route('/submit', methods=['POST'])
def submit():
    ratings = request.json.get('ratings', {})  # 取得前端送來的 {track_id: score}
    if not ratings:
        return jsonify({"error": "No ratings received"}), 400
    recommendations = recommender.recommend(ratings)
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=False)



    
