import React, { useState } from "react";
import "./Dashboard.css";
import Header from "./Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Pdf from "./pdf";

function Dashboard() {
  const [upload, setUpload] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [pdf, setPdf] = useState(false);

  const handleFileChange = (e) => {
    const files = e.target.files[0];
    const formdata = new FormData();
    formdata.append("file", files);

    const options = {
      method: "POST",
      url: "http://127.0.0.1:8000/uploadfile/",
      data: formdata,
      headers: {
        Accept: "application/json",
      },
    };
    axios
      .request(options)
      .then(function (response) {
        setUpload(true);
        console.log(response);
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  const handlesource = () => {
    setPdf(true)
  }

  const sendQuestion = async () => {
    try {
      const item = {
        query: question,
      };
      setMessages([...messages, { text: question, sender: "User" }]);

      setQuestion("");
      const response = await axios.post("http://127.0.0.1:8000/query/", item);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: response.data.result,
          sender: "Chatbot",
          source: response.data.sources,
        },
      ]);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <div className="chat-container">
        <Header />
        <Pdf />
        <div className="container-3">
          <div className="container">
            <div className="message-container">
              <div className="heading">
                <p className="message-name">Chatbot</p>
                <p className="message-time">01:05:04 PM</p>
              </div>
              <div className="container2">
                <p>Hello there, Welcome to AskAnyQuery related to Data!</p>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="message-container">
              <div className="heading">
                <p className="message-name">Chatbot</p>
                <p className="message-time">01:05:04 PM</p>
              </div>
              <div className="fileUploadContainer">
                <p>Please upload a PDF file to begin!</p>
                {!upload ? (
                  <div className="uploadInputContainer">
                    <input
                      accept="application/pdf"
                      multiple
                      type="file"
                      className="fileInput"
                      onChange={handleFileChange}
                    />
                    <a>
                      <FontAwesomeIcon
                        icon={faCloudArrowUp}
                        className="uploadIcon"
                      />
                    </a>
                    <div className="fileDropArea">
                      <p className="uploadInstructions">
                        Drag and drop files here
                      </p>
                      <span className="fileSizeLimit">Limit 20mb.</span>
                    </div>
                    <button
                      className="uploadButton"
                      onClick={() =>
                        document.querySelector(".fileInput").click()
                      }
                    >
                      Browse Files
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {upload ? (
            <div className="container">
              <div className="message-container">
                <div className="heading">
                  <p className="message-name">Chatbot</p>
                  <p className="message-time">01:05:04 PM</p>
                </div>
                <div className="fileUploadContainer">
                  <p>You can now ask question!!</p>
                </div>
              </div>
            </div>
          ) : null}
          <div className="container">
            {messages.map((message, index) => (
              <div
                className={`message-container ${message.sender}`}
                key={index}
              >
                <div className="heading">
                  <p className="message-name">{message.sender}</p>
                  <p className="message-time">01:05:04 PM</p>
                </div>
                <div className="fileUploadContainer">
                  <p>{message.text}</p>
                  <span className="source" onClick={handlesource}>
                    {message.source && <p>Source: {message.source}</p>}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="container-5">
          <div className="container-6">
            <div className="container-7">
              <input
                type="text"
                name="question"
                id=""
                className="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <a onClick={sendQuestion}>
                <FontAwesomeIcon icon={faPaperPlane} className="sendIcon" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
