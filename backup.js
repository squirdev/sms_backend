const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");

const uri = "mongodb://localhost:27017";
const dbName = "test";
const collectionName = "sms";
const userId = "67f92f79be9c52339c381791";
const outputPath = "output_phone.txt";

async function main() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const cursor = collection.find({ userId: new ObjectId(userId) });
    const allPhones = [];

    await cursor.forEach((doc) => {
      if (Array.isArray(doc.input_phone)) {
        allPhones.push(...doc.input_phone); // Merge all arrays
      }
    });

    if (allPhones.length > 0) {
      const data = allPhones.join("\n");
      fs.writeFileSync(outputPath, data, "utf-8");
      console.log(`Saved ${allPhones.length} phone numbers to ${outputPath}`);
    } else {
      console.log("No input_phone data found.");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

main();
