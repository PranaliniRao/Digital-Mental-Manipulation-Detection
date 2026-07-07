import streamlit as st
import os
import json
import traceback
from typing import Dict, Any

# Import client, agents, and scoring engine
from utils.llm import GeminiClient
from utils.scoring import calculate_manipulation_risk
from agents.intent import IntentAnalyzerAgent
from agents.vulnerability import VulnerabilityAnalyzerAgent
from agents.bias import CognitiveBiasAnalyzerAgent
from agents.influence import InfluenceStrategyAnalyzerAgent
from agents.judge import JudgeAgent

# Page configuration
st.set_page_config(
    page_title="Psychological Vulnerability Modeling for Digital Manipulation Detection",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom premium CSS
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
}

.main-title {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 2.5rem;
    background: linear-gradient(135deg, #6366F1, #EC4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.2rem;
}

.subtitle {
    font-family: 'Inter', sans-serif;
    color: #6B7280;
    font-size: 1.1rem;
    margin-bottom: 2rem;
    font-weight: 400;
}

.section-header {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 1.6rem;
    color: #1F2937;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid #F3F4F6;
    padding-bottom: 0.4rem;
}

.metric-card {
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    padding: 1.2rem;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    transition: transform 0.2s;
    height: 100%;
}

.metric-card:hover {
    transform: translateY(-2px);
}

.metric-value {
    font-family: 'Outfit', sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
}

.metric-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #4B5563;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 0.5rem;
}

.badge-manipulation {
    background-color: #FEE2E2;
    color: #DC2626;
    font-weight: 700;
    font-size: 1.0rem;
    padding: 0.4rem 1.2rem;
    border-radius: 50px;
    border: 1px solid #FCA5A5;
    display: inline-block;
    text-align: center;
    margin-bottom: 0.5rem;
}

.badge-safe {
    background-color: #D1FAE5;
    color: #059669;
    font-weight: 700;
    font-size: 1.0rem;
    padding: 0.4rem 1.2rem;
    border-radius: 50px;
    border: 1px solid #6EE7B7;
    display: inline-block;
    text-align: center;
    margin-bottom: 0.5rem;
}

.badge-bias {
    background-color: #F3E8FF;
    color: #7E22CE;
    border: 1px solid #C084FC;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    display: inline-block;
    margin: 0.2rem;
}

.badge-agreement {
    background-color: #EFF6FF;
    color: #1D4ED8;
    border: 1px solid #93C5FD;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 0.3rem 0.8rem;
    border-radius: 4px;
    display: inline-block;
}

.pipeline-step {
    background: #F9FAFB;
    border: 1px dashed #D1D5DB;
    border-radius: 12px;
    padding: 0.8rem;
    text-align: center;
    font-size: 0.9rem;
}

.pipeline-arrow {
    font-size: 1.2rem;
    color: #9CA3AF;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}
</style>
""", unsafe_allow_html=True)

# Presets of real-world text for testing
PRESETS = {
    "--- Select a Research Preset ---": "",
    "Multi-Level Marketing (MLM) Recruitment": (
        "Hey hun! I’ve been following your posts and you look so amazing, but I can tell you’re working so hard and probably feeling exhausted. "
        "I used to be stuck in that exact same 9-to-5 grind, feeling completely isolated and barely making ends meet. But then I found this "
        "incredible community of boss babes! We support each other, travel together, and make passive income from our phones! There are only "
        "2 spots left in my mentorship group this month, and I really want it to be you. Don't let your self-doubt or negative family members "
        "hold you back from your dreams. DM me right now to claim your spot!"
    ),
    "Scareware Support Center Scam": (
        "WARNING: YOUR COMPUTER HAS BEEN COMPROMISED BY TROJAN HYDRA.EXE VIRUS. Immediate action is required to prevent data theft, banking "
        "credential loss, and hard drive erasure. Microsoft Security Essentials has blocked 14 unauthorized connection attempts. DO NOT "
        "SHUT DOWN OR RESTART YOUR COMPUTER. Call our toll-free Microsoft Certified Support Hotline at 1-800-555-0199 immediately. Failure to "
        "call within 5 minutes will result in permanent system lock and notification to local law enforcement regarding illegal web activity."
    ),
    "Relationship Emotional Blackmail": (
        "If you actually loved me, you wouldn't even think about going out with your friends tonight. You know how much my anxiety has been "
        "acting up, and leaving me alone in this house makes me feel like you don't care if I live or die. Remember when I stayed by your side "
        "when you failed your exams? I guess my sacrifices don't mean anything to you. If you walk out that door, don't expect me to be here "
        "when you get back. It's your choice: your friends or our relationship."
    ),
    "Urgent Phishing Account Suspension": (
        "Dear Valued Account Holder, We detected a suspicious login attempt from an unknown device in Russia on your online banking profile. "
        "To protect your funds, we have temporarily suspended your account access. You must verify your identity immediately by clicking "
        "the secure link below to prevent permanent account termination and a fee of $150.00: http://security-bank-verification.com/login. "
        "Please note that banking regulations require verification within 24 hours of this notice."
    ),
    "Safe / Neutral Message": (
        "Hey! Are you still up for lunch today? I was thinking we could try that new taco place down the street. Let me know what time works "
        "for you, I'm pretty flexible between 12 and 2 PM. Talk soon!"
    )
}

# Sidebar - Key and Configuration
st.sidebar.markdown("### 🛠️ Configuration & Credentials")

# Fetch API key from environment variable if set
default_key = os.environ.get("GEMINI_API_KEY", "")
api_key = st.sidebar.text_input("Gemini API Key:", value=default_key, type="password", help="Get a key from Google AI Studio")

# Model selection
model_choice = st.sidebar.selectbox(
    "Select LLM Model:",
    ["gemini-2.5-flash", "gemini-2.5-pro"],
    index=0,
    help="gemini-2.5-flash is faster and recommended for prototypes. gemini-2.5-pro has deeper analytical capabilities."
)

st.sidebar.markdown("---")
st.sidebar.markdown("### 📖 About the Research Model")
st.sidebar.markdown(
    "Instead of directly deciding if text is a scam, this framework sequentially models "
    "underlying cognitive processes. Outlining intents, targeted vulnerabilities, cognitive biases, "
    "and influence strategies feeds a transparent scoring engine. The Judge Agent combines "
    "these structural indicators with narrative reasoning to determine agent agreement."
)

# Set up text state management via session state
if 'input_text' not in st.session_state:
    st.session_state.input_text = ""


def clamp_value(value, min_value: float = 0.0, max_value: float = 100.0) -> float:
    try:
        normalized = float(value)
    except (TypeError, ValueError):
        return min_value
    return max(min_value, min(normalized, max_value))


def safe_progress_value(value) -> float:
    try:
        progress = float(value)
    except (TypeError, ValueError):
        return 0.0

    if 1.0 < progress <= 100.0:
        progress = progress / 100.0

    return max(0.0, min(progress, 1.0))


def on_preset_change():
    preset_key = st.session_state.preset_select
    if preset_key in PRESETS:
        st.session_state.input_text = PRESETS[preset_key]

# Main UI layout
st.markdown("<div class='main-title'>Psychological Vulnerability Modeling</div>", unsafe_allow_html=True)
st.markdown("<div class='subtitle'>Digital Manipulation Detection through Sequential Cognitive Profiling</div>", unsafe_allow_html=True)

# Grid layout for selection and text box
st.selectbox("Select a research preset (optional):", list(PRESETS.keys()), key="preset_select", on_change=on_preset_change)
input_text = st.text_area("Input Text for Vulnerability and Manipulation Analysis:", key="input_text", height=180)

# Pipeline Flow Visualization
st.markdown("<div class='section-header'>Sequential Analysis Pipeline</div>", unsafe_allow_html=True)
p_cols = st.columns([2, 0.4, 2, 0.4, 2, 0.4, 2, 0.4, 2])

with p_cols[0]:
    st.markdown("<div class='pipeline-step'><strong>1. Intent</strong><br><small>Speaker intent</small></div>", unsafe_allow_html=True)
with p_cols[1]:
    st.markdown("<div class='pipeline-arrow'>➔</div>", unsafe_allow_html=True)
with p_cols[2]:
    st.markdown("<div class='pipeline-step'><strong>2. Vulnerability</strong><br><small>Target weakness</small></div>", unsafe_allow_html=True)
with p_cols[3]:
    st.markdown("<div class='pipeline-arrow'>➔</div>", unsafe_allow_html=True)
with p_cols[4]:
    st.markdown("<div class='pipeline-step'><strong>3. Cognitive Bias</strong><br><small>Reader shortcuts</small></div>", unsafe_allow_html=True)
with p_cols[5]:
    st.markdown("<div class='pipeline-arrow'>➔</div>", unsafe_allow_html=True)
with p_cols[6]:
    st.markdown("<div class='pipeline-step'><strong>4. Influence Strategy</strong><br><small>Active tactics</small></div>", unsafe_allow_html=True)
with p_cols[7]:
    st.markdown("<div class='pipeline-arrow'>➔</div>", unsafe_allow_html=True)
with p_cols[8]:
    st.markdown("<div class='pipeline-step' style='border: 1px solid #6366F1; background: #EEF2FF;'><strong>5. Judge Agent</strong><br><small>Final consensus</small></div>", unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Run button
run_button = st.button("🚀 Run Manipulation Analysis", use_container_width=True, type="primary")

if run_button:
    if not api_key:
        st.error("🔑 Please provide a Gemini API Key in the sidebar configuration to run the analysis.")
    elif not input_text.strip():
        st.warning("✍️ Please enter some text or select a preset before starting the analysis.")
    else:
        # Initialize client and agents
        client = GeminiClient(api_key=api_key)
        
        intent_agent = IntentAnalyzerAgent(client)
        vulnerability_agent = VulnerabilityAnalyzerAgent(client)
        bias_agent = CognitiveBiasAnalyzerAgent(client)
        influence_agent = InfluenceStrategyAnalyzerAgent(client)
        judge_agent = JudgeAgent(client)
        
        # Pipeline status tracker
        progress_text = st.empty()
        progress_bar = st.progress(0.0)
        
        try:
            # 1. Intent Analysis
            progress_text.info("🕵️ Running Agent 1: Intent Analysis...")
            progress_bar.progress(safe_progress_value(10))
            intent_res = intent_agent.analyze_text(input_text, model=model_choice)
            intent_res_dict = intent_res.model_dump()
            with open("intent.json", "w") as f:
                json.dump(intent_res_dict, f, indent=4)
            
            # 2. Vulnerability Analysis
            progress_text.info("🧬 Running Agent 2: Vulnerability Analysis...")
            progress_bar.progress(safe_progress_value(30))
            vuln_res = vulnerability_agent.analyze_text(input_text, model=model_choice)
            vuln_res_dict = vuln_res.model_dump()
            with open("vulnerability.json", "w") as f:
                json.dump(vuln_res_dict, f, indent=4)
                
            # 3. Cognitive Bias Analysis
            progress_text.info("🧠 Running Agent 3: Cognitive Bias Analysis...")
            progress_bar.progress(safe_progress_value(50))
            bias_res = bias_agent.analyze_text(input_text, model=model_choice)
            bias_res_dict = bias_res.model_dump()
            with open("bias.json", "w") as f:
                json.dump(bias_res_dict, f, indent=4)
            
            # 4. Influence Strategy Analysis
            progress_text.info("🎯 Running Agent 4: Influence Strategy Analysis...")
            progress_bar.progress(safe_progress_value(70))
            influence_res = influence_agent.analyze_text(input_text, model=model_choice)
            influence_res_dict = influence_res.model_dump()
            with open("strategy.json", "w") as f:
                json.dump(influence_res_dict, f, indent=4)
                
            # 5. Psychological Risk Engine Execution (Framework level scoring)
            progress_text.info("📊 Running Psychological Risk Engine calculations...")
            progress_bar.progress(safe_progress_value(85))
            risk_res_dict = calculate_manipulation_risk(
                intent_analysis=intent_res_dict,
                vulnerability_analysis=vuln_res_dict,
                bias_analysis=bias_res_dict,
                influence_analysis=influence_res_dict
            )
            with open("risk_engine.json", "w") as f:
                json.dump(risk_res_dict, f, indent=4)
            
            # 6. Final Judge Synthesis
            progress_text.info("⚖️ Running Judge Agent: Assessing agreement and final verdict...")
            progress_bar.progress(safe_progress_value(95))
            judge_res = judge_agent.analyze_pipeline(
                text=input_text,
                intent_output=intent_res_dict,
                vulnerability_output=vuln_res_dict,
                bias_output=bias_res_dict,
                influence_output=influence_res_dict,
                risk_engine_output=risk_res_dict,
                model=model_choice
            )
            judge_res_dict = judge_res.model_dump()
            with open("judge.json", "w") as f:
                json.dump(judge_res_dict, f, indent=4)
            
            progress_bar.progress(safe_progress_value(100))
            progress_text.success("✅ Framework Analysis Complete! Intermediate JSON files saved locally.")
            
            # Display Final Judgment Dashboard
            st.markdown("<div class='section-header'>Manipulation Assessment Dashboard</div>", unsafe_allow_html=True)
            
            # Metric Card grid (4 columns)
            m_col1, m_col2, m_col3, m_col4 = st.columns(4)
            
            with m_col1:
                st.markdown("<div class='metric-card'>", unsafe_allow_html=True)
                if judge_res.manipulation_detected:
                    st.markdown("<div class='badge-manipulation'>MANIPULATION DETECTED</div>", unsafe_allow_html=True)
                else:
                    st.markdown("<div class='badge-safe'>NO MANIPULATION DETECTED</div>", unsafe_allow_html=True)
                st.markdown("<div class='metric-label'>Final Verdict</div>", unsafe_allow_html=True)
                st.markdown("</div>", unsafe_allow_html=True)
                
            with m_col2:
                # Color code score based on risk engine output
                score = clamp_value(risk_res_dict.get("total_risk_score", 0))
                score_color = "#DC2626" if score >= 70 else ("#F59E0B" if score >= 35 else "#10B981")
                st.markdown(f"""
                <div class='metric-card'>
                    <div class='metric-value' style='color: {score_color};'>{score}/100</div>
                    <div class='metric-label'>Manipulation Risk Score ({risk_res_dict.get("risk_level", "Unknown")})</div>
                </div>
                """, unsafe_allow_html=True)
                
            with m_col3:
                # Display Judge Agent agreement indicator
                agreement = judge_res.agent_agreement
                agree_color = "#10B981" if agreement == "Strong Agreement" else ("#F59E0B" if agreement == "Moderate Agreement" else "#DC2626")
                st.markdown(f"""
                <div class='metric-card'>
                    <div class='badge-agreement' style='color: {agree_color}; border-color: {agree_color};'>{agreement}</div>
                    <div class='metric-label'>Agent & Engine Agreement</div>
                </div>
                """, unsafe_allow_html=True)
                
            with m_col4:
                # Color code LLM confidence score
                conf = clamp_value(judge_res.confidence_score)
                conf_color = "#10B981" if conf >= 70 else ("#F59E0B" if conf >= 40 else "#DC2626")
                st.markdown(f"""
                <div class='metric-card'>
                    <div class='metric-value' style='color: {conf_color};'>{conf}%</div>
                    <div class='metric-label'>LLM Confidence</div>
                </div>
                """, unsafe_allow_html=True)
                
            # Detailed Analysis Panel
            st.markdown("<br>", unsafe_allow_html=True)
            col_left, col_right = st.columns([3, 2])
            
            with col_left:
                st.info("📊 **Comprehensive Framework Explanation**")
                st.write(judge_res.explanation)
                
                st.markdown("##### ⚖️ **Agreement & Discrepancy Analysis**")
                st.write(judge_res.disagreement_explanation)
                
                # Visual breakdown bar chart of component score contributions
                st.markdown("##### 📈 **Manipulation Component Weight Contributions**")
                for component, val in risk_res_dict["component_scores"].items():
                    val = clamp_value(val)
                    contrib = clamp_value(risk_res_dict["weighted_contributions"].get(component, 0))
                    st.write(f"**{component}**: score {val}/100 (weighted contribution: +{contrib})")
                    st.progress(safe_progress_value(val / 100.0))
                
            with col_right:
                # Component contribution table
                st.markdown("##### 🧬 **Scoring Contribution Details**")
                table_data = []
                for comp, raw_val in risk_res_dict["component_scores"].items():
                    weighted_val = risk_res_dict["weighted_contributions"][comp]
                    table_data.append({"Component": comp, "Raw Score": raw_val, "Weighted Score Contribution": weighted_val})
                st.table(table_data)
                
                # Cognitive Biases Detected Badges
                st.markdown("##### 🧠 **Detected Cognitive Biases**")
                biases = [b.bias for b in bias_res.detected_biases if b.bias != "None"]
                if biases:
                    for b in biases:
                        st.markdown(f"<span class='badge-bias'>{b}</span>", unsafe_allow_html=True)
                else:
                    st.write("*No cognitive biases detected.*")
                
                st.markdown("<br>", unsafe_allow_html=True)
                st.success("🛡️ **Cognitive Defense Recommendation**")
                st.write(judge_res.defense_recommendation)
                
            # Upstream Agent Raw Output Details
            st.markdown("<div class='section-header'>Upstream Agent Analysis Details</div>", unsafe_allow_html=True)
            
            tab1, tab2, tab3, tab4 = st.tabs([
                "🕵️ Agent 1: Intent Analysis", 
                "🧬 Agent 2: Vulnerability Analysis", 
                "🧠 Agent 3: Cognitive Bias Analysis",
                "🎯 Agent 4: Influence Strategy Analysis"
            ])
            
            with tab1:
                st.markdown(f"### Dominant Speaker Intent: `{intent_res.primary_intent}`")
                st.markdown("#### Detected Intents & Confidence Levels:")
                for item in intent_res.intents_detected:
                    if item.intent != "None":
                        confidence = clamp_value(item.confidence)
                        st.progress(safe_progress_value(confidence / 100.0))
                        st.markdown(f"**{item.intent}** (Confidence: {confidence}%)")
                
                st.markdown("#### Evidence Snippets In Text:")
                for ev in intent_res.evidence:
                    st.markdown(f"- *\"{ev}\"*")
                
                st.markdown("#### Linguistic Analysis Reasoning:")
                st.info(intent_res.reasoning)
                
            with tab2:
                st.markdown("### Targeted Psychological Vulnerabilities:")
                for item in vuln_res.vulnerabilities_targeted:
                    if item.vulnerability != "None":
                        color = "red" if item.severity == "High" else ("orange" if item.severity == "Medium" else "blue")
                        st.markdown(f"**{item.vulnerability}** - Severity: :{color}[**{item.severity}**]")
                        st.write(item.reasoning)
                        st.markdown("---")
                
                st.markdown("#### Targeted Demographic Analysis:")
                st.write(", ".join(vuln_res.targeted_demographics))
                
                st.markdown("#### Vulnerability Exploit Mechanism:")
                st.info(vuln_res.analysis)
                
            with tab3:
                st.markdown(f"### Overall Cognitive Bias Density Score: **{bias_res.overall_bias_score}/100**")
                st.markdown("#### Triggered Heuristics & Biases:")
                for item in bias_res.detected_biases:
                    if item.bias != "None":
                        confidence = clamp_value(item.confidence)
                        st.progress(safe_progress_value(confidence / 100.0))
                        st.markdown(f"**{item.bias}** (Confidence: {confidence}%)")
                        st.markdown(f"*Evidence:* \"{item.evidence}\"")
                        st.write(item.explanation)
                        st.markdown("---")
                
                st.markdown("#### Cognitive Bias Explanation:")
                st.info(bias_res.explanation)
                
            with tab4:
                st.markdown(f"### Detected Manipulation Tactics Count: **{influence_res.manipulation_tactics_count}**")
                st.markdown(f"### Tactic Subtlety Level: **{influence_res.subtlety_level}**")
                
                st.markdown("#### Strategies Identified:")
                for strat in influence_res.strategies_identified:
                    if strat.strategy != "None":
                        st.markdown(f"🔹 **{strat.strategy}**")
                        st.markdown(f"*Evidence:* \"{strat.evidence}\"")
                        st.markdown(f"*Mechanism:* {strat.explanation}")
                        st.markdown("---")
                        
        except Exception as e:
            st.error("Failed to complete manipulation pipeline.")
            st.exception(e)
            st.code(traceback.format_exc())
            st.info("Check your API key validity, your active network connection, and the model selected.")
