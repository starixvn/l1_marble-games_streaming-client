const { DevTools, Tolgee } = require("@tolgee/web");
const fs = require("fs");
const path = require("path");

const CONFIG = {
  languageFolder: "./assets/resources/i18n/",
  tolgee: {
    defaultLanguage: "en",
    apiKey: "tgpat_aemqprqg41pcic4h0h5gkarfid2lepvaru4nqmmgjv85sfn9vlg",
    apiUrl: "https://tolgee.sabagame.com",
    projectId: "9",
    defaultNs: "messages",
  },
};

async function fetchAvailableLanguages() {
  console.log("🔍 Fetching available languages from Tolgee...");

  try {
    const response = await fetch(
      `${CONFIG.tolgee.apiUrl}/v2/projects/${CONFIG.tolgee.projectId}/languages`,
      {
        method: "GET",
        headers: {
          "X-API-Key": CONFIG.tolgee.apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const languageCodes = data._embedded.languages.map((lang) => lang.tag);

    console.log(
      `✅ Found ${
        languageCodes.length
      } available languages: ${languageCodes.join(", ")}`,
    );
    return languageCodes;
  } catch (error) {
    console.error("❌ Failed to fetch available languages:", error.message);
    return [];
  }
}

async function fetchNamespaces() {
  console.log("🔍 Fetching available namespaces from Tolgee...");

  try {
    const response = await fetch(
      `${CONFIG.tolgee.apiUrl}/v2/projects/${CONFIG.tolgee.projectId}/used-namespaces`,
      {
        method: "GET",
        headers: {
          "X-API-Key": CONFIG.tolgee.apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const namespaces = data._embedded.namespaces.map((ns) => ns.name);

    console.log(
      `✅ Found ${namespaces.length} available namespaces: ${namespaces.join(
        ", ",
      )}`,
    );

    return namespaces;
  } catch (error) {
    console.error("❌ Failed to fetch available namespaces:", error.message);
    return [];
  }
}

function writeLanguageFile(fileName, content) {
  const filePath = path.join(fileName + ".ts");

  try {
    fs.writeFileSync(filePath, content, { encoding: "utf8", flag: "w" });
  } catch (error) {
    console.error(`❌ Failed to write ${filePath}:`, error.message);
    throw error;
  }
}

function createLanguageFileContent(languageId, languageData) {
  return `const win = window || {} as any;
export const languages = ${JSON.stringify(languageData, null, 4)};

if (!win.languages) {
    win.languages = {};
}
                          
win.languages["${languageId}"] = languages;`;
}

function extractNamespaceTranslations(records, namespace) {
  const translations = {};

  records.forEach((record) => {
    if (record.namespace === namespace) {
      Object.entries(record.data).forEach(([key, value]) => {
        translations[key] = value;
      });
    }
  });

  return translations;
}

async function processLanguage(tg, languageId, namespaces) {
  console.log(`🔄 Processing language: ${languageId}`);

  await tg.changeLanguage(languageId);
  const languageData = {};

  namespaces.forEach((namespace) => {
    const translations = extractNamespaceTranslations(
      tg.getAllRecords(),
      namespace,
    );
    languageData[namespace] = translations;
    console.log(
      `   📝 Found ${
        Object.keys(translations).length
      } translations for namespace: ${namespace}`,
    );
  });

  return languageData;
}

function generateLanguageFiles(languages) {
  Object.entries(languages).forEach(([languageId, languageData]) => {
    const fileContent = createLanguageFileContent(languageId, languageData);
    const filePath = path.join(CONFIG.languageFolder, languageId);
    writeLanguageFile(filePath, fileContent);
  });
}

async function generateLanguages() {
  console.log("🚀 Starting Tolgee language generation...");
  console.log(`📂 Output folder: ${CONFIG.languageFolder}\n`);

  const languageCodes = await fetchAvailableLanguages();
  const namespaces = await fetchNamespaces();
  console.log(`📋 Languages to process: ${languageCodes.join(", ")}\n`);

  const tg = Tolgee()
    .use(DevTools())
    .init({
      ...CONFIG.tolgee,
      availableLanguages: languageCodes,
      ns: namespaces,
    });

  return new Promise((resolve, reject) => {
    tg.on("initialLoad", async () => {
      try {
        console.log("📡 Connected to Tolgee API successfully");

        const allLanguages = {};

        for (const languageId of languageCodes) {
          const languageData = await processLanguage(
            tg,
            languageId,
            namespaces,
          );
          allLanguages[languageId] = languageData;
        }

        generateLanguageFiles(allLanguages);

        console.log("\n🎉 Language generation completed successfully!");
        resolve(allLanguages);
      } catch (error) {
        console.error("❌ Error during language processing:", error.message);
        reject(error);
      }
    });

    tg.run();
  });
}

async function main() {
  try {
    await generateLanguages();
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
