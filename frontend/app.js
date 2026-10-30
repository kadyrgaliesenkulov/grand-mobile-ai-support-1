
const form = document.getElementById("complaintForm");

const resultBox = document.getElementById("result");
const emptyState = document.getElementById("emptyState");

const totalCount = document.getElementById("totalCount");
const reviewCount = document.getElementById("reviewCount");
const resolvedCount = document.getElementById("resolvedCount");

let total = 0;

const categoryNames = {
    scam: "Алаяқтық",
    insult: "Балағаттау",
    cheating: "Чит қолдану",
    technical: "Техникалық мәселе",
    other: "Басқа мәселе"
};

// Шағым санатын анықтау
function detectCategory(text, selected) {

    if (selected !== "auto") {
        return selected;
    }

    const t = text.toLowerCase();

    if (/(алда|ақша|затымды|ұрла|қайтармай)/.test(t)) {
        return "scam";
    }

    if (/(балағат|қорлады|дөрекі|боқ)/.test(t)) {
        return "insult";
    }

    if (/(чит|cheat|hack|хак)/.test(t)) {
        return "cheating";
    }

    if (/(қате|ашылмай|лаг|техникалық|кірмей)/.test(t)) {
        return "technical";
    }

    return "other";
}

// Шағым жіберу
form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const payload = {
        nickname: document.getElementById("nickname").value.trim(),

        reported_nick: document.getElementById("reported").value.trim(),

        category: document.getElementById("category").value,

        description: document.getElementById("description").value.trim(),

        evidence_url: document.getElementById("evidence").value.trim()
    };

    if (payload.description.length < 10) {
        alert("Мәселені кемінде 10 таңбамен сипаттаңыз.");
        return;
    }

    total++;

    totalCount.textContent = total;
    reviewCount.textContent = total;
    resolvedCount.textContent = 0;

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/complaints",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            throw new Error("Backend қатесі");
        }

        const data = await response.json();

        showResult(data);

    } catch (error) {

        // Backend қосылмаған кезде демо режимі

        const category = detectCategory(
            payload.description,
            payload.category
        );

        showResult({
            ticket_id: "DEMO-" + Date.now().toString().slice(-6),

            category: category,

            verdict: "need_evidence",

            explanation:
                "Бұл демонстрациялық талдау. Нақты шешім үшін дәлелдер мен әкімші тексеруі қажет.",

            next_action:
                "Қажетті скриншоттар мен қосымша мәліметтерді тіркеңіз.",

            mode: "demo"
        });
    }

});

// Нәтижені экранға шығару
function showResult(data) {

    emptyState.classList.add("hidden");

    resultBox.classList.remove("hidden");

    const category =
        categoryNames[data.category] || data.category || "Анықталмады";

    resultBox.innerHTML = `
        <h3>Өтініш №${escapeHTML(data.ticket_id)}</h3>

        <p>
            <b>Санаты:</b>
            ${escapeHTML(category)}
        </p>

        <p>
            <b>Мәртебесі:</b>
            <span class="tag warn">
                ${escapeHTML(data.verdict)}
            </span>
        </p>

        <p>
            <b>Талдау:</b>
            ${escapeHTML(data.explanation)}
        </p>

        <p>
            <b>Келесі қадам:</b>
            ${escapeHTML(data.next_action)}
        </p>

        <p class="tiny">
            ${data.mode === "demo"
                ? "Демо режимі: backend іске қосылмаған."
                : "Серверден алынған нәтиже."
            }
        </p>
    `;
}

// HTML қауіпсіздігі
function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}
