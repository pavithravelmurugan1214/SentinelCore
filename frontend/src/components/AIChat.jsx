import { useState } from "react";
import { askAI } from "../services/aiService";

export default function AIChat() {

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const sendQuestion = async () => {

        if (!question.trim()) return;

        try {

            const response = await askAI(question);

            setAnswer(response.answer);

        } catch (err) {

            setAnswer("Unable to contact AI.");

        }

    };

    return (

        <div style={{padding:20}}>

            <h2>Cloud Security AI Assistant</h2>

            <textarea
                rows="4"
                value={question}
                onChange={(e)=>setQuestion(e.target.value)}
                style={{width:"100%"}}
            />

            <br/><br/>

            <button onClick={sendQuestion}>
                Ask AI
            </button>

            <hr/>

            <h3>Response</h3>

            <div>

                {answer}

            </div>

        </div>

    );

}