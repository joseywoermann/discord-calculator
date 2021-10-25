const { verifyKey, InteractionResponseType } = require("discord-interactions");
const { evaluate } = require("mathjs");

module.exports = async (request, response) => {
    if (request.method !== "POST") return;

    const isValidRequest = verifyKey(
        JSON.stringify(request.body),
        request.headers["x-signature-ed25519"],
        request.headers["x-signature-timestamp"],
        process.env.PUBLIC_KEY
    );

    if (!isValidRequest) {
        console.error("Invalid Request");
        return response.status(401).send({ error: "Bad request signature" });
    }

    const message = request.body;

    if (message.type === 1) {
        console.log("Handling Discord Ping request");
        response.send({ type: InteractionResponseType.PONG });
    } else if (message.type === 2) {
        const commandName = message.data.name.toLowerCase();
        if (commandName === "meta") {
            response.status(200).send({
                type: 4,
                data: {
                    content: `Click the buttons below to either add the bot to your server or report an issue on GitHub.`,
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: "Invite",
                                    style: 5,
                                    url: `https://discord.com/oauth2/authorize?client_id=${process.env.APPLICATION_ID}&scope=applications.commands`,
                                },
                                {
                                    type: 2,
                                    label: "Support",
                                    style: 5,
                                    url: `https://github.com/joseywoermann/discord-calculator/`,
                                },
                            ],
                        },
                    ],
                    flags: 64,
                },
            });
            console.log("meta request");
        } else if (commandName === "calculate") {
            const expression = message.data.options[0].value;

            let result;
            try {
                result = evaluate(expression);
            } catch (error) {
                result = error;
            }

            response.status(200).send({
                type: 4,
                data: {
                    embeds: [
                        {
                            title: `${result}`,
                            description: `= ${expression}`,
                        },
                    ],
                },
            });
            console.log("Calculate request");
        } else {
            console.error("Unknown Command");
            response.status(400).send({ error: "Unknown Command" });
        }
    } else {
        console.error("Unknown Type");
        response.status(400).send({ error: "Unknown Type" });
    }
};
