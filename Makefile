KEYSTORE_NAME = hexxo
KEY_ALIAS = Hexxo
KEY_SIZE = 2048
KEY_ALG = RSA
VALIDITY = 10000
BUILD_PATH = android/app/build/outputs/apk/release
BUILD_FILENAME = app-release.apk
OUTPUT_FILENAME = Hexxo.apk
OUTPUT_PATH = build

all: genkey	release rename copy

skipkey: release rename copy
	
genkey:
	keytool -genkey -v -keystore $(KEYSTORE_NAME).keystore -alias $(KEY_ALIAS) -keyalg $(KEY_ALG) -keysize $(KEY_SIZE) -validity $(VALIDITY)
	mv $(KEYSTORE_NAME).keystore android/app

release:
	cd android && ./gradlew assembleRelease

rename:
	mv $(BUILD_PATH)/$(BUILD_FILENAME) $(BUILD_PATH)/$(OUTPUT_FILENAME)

copy:	
	if [ ! -d $(OUTPUT_PATH) ]; then mkdir $(OUTPUT_PATH); fi
	cp $(BUILD_PATH)/$(OUTPUT_FILENAME) $(OUTPUT_PATH)

clean:
	cd android && ./gradlew clean

start:
	npm start
	
debug:
	npm run android