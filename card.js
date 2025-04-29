function executeFunctionWhen(fn, condition, name = "executeFunctionWhen", intervalTime = 50) {
    const startTime = performance.now();

    const intervalId = setInterval(() => {
        if (condition() == true) {
            const executionTime = performance.now() - startTime;

            console.log(`Executed <${name}> in ${executionTime}ms`);

            try {
                fn();
            } catch (error) {}

            clearInterval(intervalId);
            return;
        }
    }, intervalTime);
}

const oldInfoCard = {
    gameTextInterval: null,
    isBusinessOpen: false,
    openOldInfoCard(params, interfaceName) {
        if (typeof params === "string") params = JSON.parse(params);

        let houseTypes = [
            "Эконом класс",
            "Деревенски дом",
            "Средни класс",
            "Премиум класс",
            "Элитны дом",
            "Эконом класс",
            "VIP класс",
            "Квартира",
        ];

        let type = interfaceName == "Business" ? 1 : 0;
        let name = type == 0 ? params[1] : params[2];
        let roomAmount = type == 0 ? params[4] : params[6];
        let owner = type == 0 ? params[2] : params[3];
        let price = type == 0 ? params[6] : params[5];
        let rent = type == 0 ? params[5] : params[4];
        let paramType =
            type == 0 ? houseTypes.indexOf(params[3].replace("й", "").replace("й", "").replace("+", "")) : params[1];

        params = JSON.stringify([type, name, roomAmount, owner, price, rent, paramType]);

        window.openInterface("InfoCard", params);

        if (name.toLocaleLowerCase().includes("киоск")) {
            executeFunctionWhen(
                () => {
                    const head = window.interface("InfoCard").$el.querySelector(".biz .status");
                    head.classList.remove("status");
                    head.classList.add("text");

                    head.innerHTML = `<span style="color: hsl(336deg 28% 67%)">Свободных полок: ${roomAmount}<span>`;

                    window.interface("InfoCard").$el.querySelector(".params .info-card__data-row .text").textContent =
                        "Налог на продажу";

                    window
                        .interface("InfoCard")
                        .$el.querySelector(".params .info-card__data-row .title").textContent = `${rent}%`;
                },
                () => window.interface("InfoCard") && typeof window.interface("InfoCard").$el !== "undefined",
                100
            );

            return;
        }

        executeFunctionWhen(
            () => {
                const head = window.interface("InfoCard").$el.querySelector(".title .span");

                head.textContent = name;
            },
            () => window.interface("InfoCard") && typeof window.interface("InfoCard").$el !== "undefined",
            100
        );
    },
    onCloseInterface() {
        clearInterval(oldInfoCard.gameTextInterval);
        window.interface("GameText").add(`[3,\"~w~Для взаимодействия нажмите ~g~ALT\",500,0,0,0]`);
        window.closeInterface("InfoCard");
    },
    hookAndReplaceNewInfoCard() {
        window.App.$refs.Appartament = [
            {
                close: () => this.onCloseInterface(),
            },
        ];

        window.App.$refs.Business = [
            {
                close: () => this.onCloseInterface(),
            },
        ];

        window.openInterface = new Proxy(window.openInterface, {
            apply: (target, thisArgs, args) => {
                try {
                    if (args[0] === "Business") this.isBusinessOpen = true;

                    if (args[0] === "Business" || args[0] === "Appartament") {
                        window.interface("GameText").add(`[3,\"~w~Для взаимодействия нажмите ~g~ALT\",3000,0,0,0]`);
                        oldInfoCard.gameTextInterval = setInterval(
                            () =>
                                window
                                    .interface("GameText")
                                    .add(`[3,\"~w~Для взаимодействия нажмите ~g~ALT\",3000,0,0,0]`),
                            2000
                        );
                        oldInfoCard.openOldInfoCard(args[1], args[0]);
                        return 0;
                    }
                } catch (error) {}

                return Reflect.apply(target, thisArgs, args);
            },
        });

        this.onKeyDown();

        jsLoader.showConnectedScript("info", "Старая карточка бизов/домов by sunset");
    },

    onKeyDown() {
        document.addEventListener("keydown", (e) => {
            if (e.repeat) return;

            if (this.isBusinessOpen && e.keyCode === 18) window.sendClientEvent(0, "Business_OnPlayerEnter");
        });
    },
};

oldInfoCard.hookAndReplaceNewInfoCard();