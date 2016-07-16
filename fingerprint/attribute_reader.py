import os
import json

def read_JSON_file(path):
    with open(path) as json_file:
        json_data = json.load(json_file)
    return json_data

def get_definitions():
    descriptions = []

    for subdir, dirs, files in os.walk("fingerprint/attributes"):
        for file in files:
            if file.endswith(".json"):
                path = os.path.join(subdir, file)
                json_data = read_JSON_file(path)
                descriptions.append(json_data)

    return descriptions

def get_files_and_variables():

    sources = []
    variables = []

    attributes_folder = "fingerprint/attributes"

    for subdir, dirs, files in os.walk(attributes_folder):
        for file in files:
            if file.endswith(".json"):
                path = os.path.join(subdir, file)
                json_data = read_JSON_file(path)
                if len(json_data["files"]) > 0:
                    for f in json_data["files"]:
                        sources.append(os.path.join(subdir, f)[len(attributes_folder) + 1:])
                    variables.append(json_data["variables"])

    return sources,variables

def get_hashed_variables():
    hashedVariables = []

    descriptions = get_definitions()
    for desc in descriptions:
        if "variables" in desc and desc["hash"] == "True":
            hashedVariables.extend(desc["variables"])

    return hashedVariables




if __name__ == '__main__':
    get_definitions()