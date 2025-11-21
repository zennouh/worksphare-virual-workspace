
import fs  from "fs/promises";

async function checkMessage() {
    try {
        const file = process.argv[2]

        const msg = await fs.readFile(file, "utf-8");

        const regex = /^(WVW:|DEPLOY:)\s.+$/

        if (regex.test(msg.trim())) {
            process.exit(0)
        } else {
            console.log("Your message pattren is wrong");
            process.exit(1)
        }

    } catch (error) {
        console.log("You have an issue: ", error.message);
        process.exit(1)

    }

}

checkMessage()