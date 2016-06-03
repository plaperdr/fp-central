from flask import Flask,render_template,Blueprint
from fingerprint.attribute_reader import get_definitions,get_files_and_variables

import env_config as config


app = Flask(__name__)
app.debug = config.debug

attributes = Blueprint('site', __name__, static_url_path='', static_folder='fingerprint/attributes',url_prefix='/fp')
app.register_blueprint(attributes)


@app.route('/')
def home():
    return render_template('home.html')

@app.route('/fp')
def fp():
    files,variables = get_files_and_variables()
    return render_template('fp.html',files=files,variables=variables)

@app.route('/faq')
def faq():
    definitions = get_definitions()
    return render_template('faq.html',definitions=definitions)

if __name__ == '__main__':
    #Launch application
    app.run()
