#Translations

FP Central uses [Babel](http://babel.pocoo.org/en/latest/) and [Flask-Babel](https://pythonhosted.org/Flask-Babel/) to handle localization of FP Central.
You will find in this folder the FR translation of the website. I'm gladly welcoming 
any PR to support additional languages.

###Structure
The 'en' version of FP Central is directly present inside HTML templates and 
JavaScript files.
By executing the following command, Babel will generate a Master **.pot** file 
that references all the strings that are marked inside the code of FP Central 
to be translated. 
```bash
.venv/bin/pybabel extract -F babel.cfg -o messages.pot .
```

###Writing translations
#####Starting the translation for a new language
Execute the **init** command of PyBabel with the corresponding language code to 
generate a **.po** file. In the example below, the command generates a **messages.po**
file for the **fr** version of FP Central. The generated file has the following path:
**translation/fr/LC_MESSAGES/messages.po**.
```bash
.venv/bin/pybabel init -i messages.pot -d translations -l fr
```

#####Adding new strings for an existing language
Execute the **update** command of PyBabel. This will update all translations found in
the **translations** folder and merge the new texts with existing ones.
```bash
.venv/bin/pybabel update -i messages.pot -d translations
```

#####Translating strings
After the **.po** file has been generated or updated, you can start translating strings.
I recommend using an editor like [**Poedit**](https://poedit.net/) that provides 
a nice interface with a complete list of all strings that can be translated in the 
application.

#####Compiling the translation
The final step is to compile your **.po** file into a compressed **.mo** one that is
optimized for the application.
You can either use Poedit to directly generate the **.mo** from your **.po** file or you can execute the
following command to compile all existing translations.
```bash
.venv/bin/pybabel compile -d translations
```

That is it! Your translation is now ready to be used by the application!