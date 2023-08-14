import json

from Crypto.Cipher import AES


class EncryptionDecryption:
    keyInStr = ""
    key = None
    nonce = None
    tag = None

    def __init__(self):
        self.readSecrets()

    def readSecrets(self):
        with open("AKEB/Cryptography/secrets.json", "r") as f:
            secrets = json.load(f)

        key = secrets["key"]
        self.keyInStr = key

        nonce = secrets["nonce"]
        tag = secrets["tag"]

        self.convertSecretsIntoBytes(key, nonce, tag)

    def convertSecretsIntoBytes(self, key, nonce, tag):
        self.key = key.encode("utf-8")

        if nonce != None:
            self.nonce = bytes.fromhex(nonce)

        if tag != None:
            self.tag = bytes.fromhex(tag)

    def encrypt(self, rawValue):
        rawValueInJSON = json.dumps(rawValue)
        rawValueInBytes = rawValueInJSON.encode("utf-8")

        cipher = AES.new(self.key, AES.MODE_EAX)
        nonce = cipher.nonce
        self.nonce = nonce

        ciphertext, tag = cipher.encrypt_and_digest(rawValueInBytes)
        self.tag = tag

        self.saveSecrets()

        return ciphertext.hex()

    def decrypt(self, cipherTextInStr):
        print("nonce", self.nonce)
        print("tag", self.tag)

        cipherText = bytes.fromhex(cipherTextInStr)
        cipher = AES.new(self.key, AES.MODE_EAX, self.nonce)

        plainTextInBytes = cipher.decrypt_and_verify(cipherText, self.tag)

        plainTextInStr = plainTextInBytes.decode("utf-8")

        return json.loads(plainTextInStr)

    def saveSecrets(self):
        nonce, tag = self.convertSecretBytesIntoStrings()

        dict = {"key": self.keyInStr, "nonce": nonce, "tag": tag}

        with open("AKEB/Cryptography/secrets.json", "w") as f:
            json.dump(dict, f)
        f.close()

    def convertSecretBytesIntoStrings(self):
        nonce = self.nonce.hex()
        tag = self.tag.hex()

        return (nonce, tag)
