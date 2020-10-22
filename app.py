from flask import Flask, render_template, request, jsonify, redirect, url_for, json
from DialogSys import DialogSys
#import requests
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy import create_engine
from sql_model import dialog
import pdb
some_engine = create_engine('mysql+mysqlconnector://zixi:200683088@localhost:3308/dialogsys')
session_factory = sessionmaker(bind=some_engine)
Session = scoped_session(session_factory)
session_tmp = Session()
app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret' 
chatbot = DialogSys()

@app.route('/', methods=['GET'])
def main(): 
  if request.method =='GET': 
    print(app.static_folder)
    return render_template('index.html')

@app.route('/generate/', methods=['POST'])
def generate():
  if request.method=='POST':
    #pdb.set_trace()
    data = json.loads(request.data)
    response = chatbot.decode(data)
    #pdb.set_trace()
    print('data', data)
    print('response', response)
    return json.dumps(response)

@app.route('/database/insert', methods=['POST'])
def save_to_db():
  if request.method=='POST':
    pdb.set_trace()
    session = Session()
    data = json.loads(request.data)
    new_dialog = dialog(user_id=data['user_id'], log=data['log'])
    session.add(new_dialog)
    session.commit()
    session.close()
    return 'succeed'

if __name__ == '__main__':
  # app.run(host='0.0.0.0', port=5000, use_debugger=False, use_reloader=False, passthrough_errors=True)
  app.run(host='0.0.0.0', port=8080, debug=True)