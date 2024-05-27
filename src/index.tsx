import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom"
import Leaderboard from "./LeaderboardComp"

import "./index.css"

import mockDataInfillingLightSpan from "./mocks/code_infilling_light_span.json"
import mockDataInfillingMultiLine from "./mocks/code_infilling_multi_line.json"
import mockDataInfillingSingleLine from "./mocks/code_infilling_single_line.json"
import mockDataInfillingSpan from "./mocks/code_infilling_span.json"
import mockDataComplete from "./mocks/code_complete.json"
import mockDataExpalin from "./mocks/code_expalin.json"


const LeaderboardTabs = () => {
  // State to track the currently selected tab
  const [activeTab, setActiveTab] = useState('tab2');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Function to render the leaderboard based on the selected tab
  const renderLeaderboard = () => {
    // console.log(activeTab);
    switch (activeTab) {
      case 'tab1':
        return <Leaderboard theme={{ base: "light" }} args={[mockDataInfillingLightSpan, "infilling"]} />;
      case 'tab2':
        return <Leaderboard theme={{ base: "light" }} args={[mockDataInfillingMultiLine, "infilling"]} />;
      case 'tab3':
        return <Leaderboard theme={{ base: "light" }} args={[mockDataInfillingSingleLine, "complete"]} />;
      case 'tab4':
        return <Leaderboard theme={{ base: "light" }} args={[mockDataInfillingSpan, "expalin"]} />;
      case 'tab5':
        return <Leaderboard theme={{ base: "light" }} args={[mockDataComplete, "complete"]} />;
      case 'tab6':
        return <Leaderboard theme={{ base: "light" }} args={[mockDataExpalin, "expalin"]} />;
      default:
        return <div>Select a tab</div>;
    }
  };
  return (
    <div className="tabs-container">
      <ul className={`tabs ${isMobile ? 'mobile' : ''}`}>
        <li className={activeTab === 'tab1' ? 'is-active' : ''} onClick={() => setActiveTab('tab1')}><a>Infilling Light Span</a></li>
        <li className={activeTab === 'tab2' ? 'is-active' : ''} onClick={() => setActiveTab('tab2')}><a>Infilling Multi Line</a></li>
        <li className={activeTab === 'tab3' ? 'is-active' : ''} onClick={() => setActiveTab('tab3')}><a>Infilling Single Line</a></li>
        <li className={activeTab === 'tab4' ? 'is-active' : ''} onClick={() => setActiveTab('tab4')}><a>Infilling Span</a></li>
        <li className={activeTab === 'tab5' ? 'is-active' : ''} onClick={() => setActiveTab('tab5')}><a>Complete</a></li>
        <li className={activeTab === 'tab6' ? 'is-active' : ''} onClick={() => setActiveTab('tab6')}><a>Expalin</a></li>
      </ul>
      <div className="tab-content">
        {renderLeaderboard()}
      </div>
    </div>
  );
};


ReactDOM.render(
  <React.StrictMode>
    <section className="hero">
      <div className="hero-body">
        <div className="container is-fluid">
          <div className="columns  is-fullwidth">
            <div className="column has-text-centered is-fullwidth">
              <h1 className="title is-1 publication-title">
                MCEVAL: Massively Multilingual Code Evaluation
              </h1>
              <div className="column has-text-centered">
                <div className="publication-links">
                  <span className="link-block">
                    <a href="https://arxiv.org/abs/2403.07974"
                      className="external-link button is-normal is-rounded is-dark">
                      <span className="icon">
                        <i className="fas fa-file-pdf"></i>
                      </span>
                      <span>Paper</span>
                    </a>
                  </span>

                  <span className="link-block">
                    <a href="https://github.com/LiveCodeBench/LiveCodeBench"
                      className="external-link button is-normal is-rounded is-dark">
                      <span className="icon">
                        <i className="fab fa-github"></i>
                      </span>
                      <span>Code</span>
                    </a>
                  </span>

                  <span className="link-block">
                    <a href="https://huggingface.co/livecodebench/"
                      className="external-link button is-normal is-rounded is-dark">
                      <span className="icon">
                        <i className="far fa-images"></i>
                      </span>
                      <span>Data</span>
                    </a>
                  </span>

                  <span className="link-block">
                    <a
                      href="https://livecodebench.github.io/"
                      className="external-link button is-normal is-rounded is-dark"
                    >
                      <span className="icon">
                        <i className="fas fa-home"></i>
                      </span>
                      <span>Home</span>
                    </a>
                  </span>

                </div>
              </div>
              <div className="column has-text-centered">
                <LeaderboardTabs />
              </div>


              <section className="section">
                <div className="container is-max-desktop">
                  <div className="columns is-centered has-text-centered">
                    <div className="column is-four-fifths">
                      <h2 className="title is-3">Submitting Custom Models</h2>
                      <div className="content has-text-justified">
                        <p>
                          To submit models to the leaderboard, you can run the evaluation using the evaluation scripts in <a href="https://github.com/LiveCodeBench/LiveCodeBench">GitHub</a>. Once you have the results,
                          you can fill out <a href="https://forms.gle/h2abvAHh6UnhWzzd9">this form</a>. You will need to fill out
                          model details and provide the generated evaluation file with model generations and pass@1 scores. We will
                          review the submission and add the model to the leaderboard accordingly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>



            </div>
          </div>
        </div>
      </div>
    </section>
  </React.StrictMode>,
  document.getElementById("root")
)