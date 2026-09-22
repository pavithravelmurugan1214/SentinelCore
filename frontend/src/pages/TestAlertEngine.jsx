import { useState } from "react";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AnimatedBackground from "../components/AnimatedBackground";

import GlassCard from "../components/ui/GlassCard";
import PageHeader from "../components/ui/PageHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import api from "../services/api";

function TestAlertEngine() {

    const [normalLoading, setNormalLoading] = useState(false);
    const [iocLoading, setIocLoading] = useState(false);

    // ==========================================
    // TEST 1
    // Normal Alert Rule Event
    // ==========================================

    const sendNormalTestEvent = async () => {

        setNormalLoading(true);

        try {

            const response = await api.post(
                "/alert-engine/process",
                {
                    eventType: "FAILED_LOGIN",
                    value: 8,
                    source: "Firewall",
                    description:
                        "8 failed login attempts detected"
                }
            );

            console.log(
                "Normal event response:",
                response.data
            );

            toast.success(
                "⚡ FAILED_LOGIN security event processed successfully!",
                { position: "top-right", autoClose: 4000, theme: "dark" }
            );

        } catch (error) {

            console.error(
                "Normal event failed:",
                error
            );

            const msg = error.response?.data?.message || error.response?.data || error.message || "Failed to process FAILED_LOGIN event";
            toast.error(
                `❌ Failed to process FAILED_LOGIN event: ${msg}`,
                { position: "top-right", autoClose: 5000, theme: "dark" }
            );

        } finally {

            setNormalLoading(false);

        }
    };


    // ==========================================
    // TEST 2
    // IOC → Threat → Alert Automation
    // ==========================================

    const sendIOCTestEvent = async () => {

        setIocLoading(true);

        try {

            const response = await api.post(
                "/alert-engine/process",
                {
                    eventType: "NETWORK_CONNECTION",

                    value: 1,

                    source: "Firewall",

                    description:
                        "Outbound connection detected to known malicious IP",

                    // Must match an IOC stored
                    // in the IOC database
                    indicator: "185.220.101.10",

                    indicatorType: "IP"
                }
            );

            console.log(
                "IOC event response:",
                response.data
            );

            toast.success(
                "🚨 IOC security event processed successfully! Threat and Alert correlation completed.",
                { position: "top-right", autoClose: 4000, theme: "dark" }
            );

        } catch (error) {

            console.error(
                "IOC event failed:",
                error
            );

            const msg = error.response?.data?.message || error.response?.data || error.message || "Failed to process IOC security event";
            toast.error(
                `❌ Failed to process IOC security event: ${msg}`,
                { position: "top-right", autoClose: 5000, theme: "dark" }
            );

        } finally {

            setIocLoading(false);

        }
    };


    return (

        <>

            <Navbar />

            <Sidebar />


            <main
                className="
                    ml-64
                    mt-16
                    min-h-screen
                    bg-slate-950
                    relative
                    overflow-hidden
                "
            >

                <AnimatedBackground />


                <div className="relative z-10 p-8">


                    <PageHeader
                        title="Security Detection Engine"
                        subtitle="Test automatic security event detection and IOC correlation"
                    />


                    <div
                        className="
                            max-w-5xl
                            mx-auto
                            grid
                            grid-cols-1
                            lg:grid-cols-2
                            gap-6
                        "
                    >


                        {/* =====================================
                            NORMAL ALERT ENGINE TEST
                        ====================================== */}

                        <GlassCard className="p-8">

                            <div className="text-center">

                                <div
                                    className="
                                        w-14
                                        h-14
                                        mx-auto
                                        mb-5
                                        rounded-2xl
                                        bg-amber-500/10
                                        border
                                        border-amber-500/20
                                        flex
                                        items-center
                                        justify-center
                                        text-2xl
                                    "
                                >
                                    ⚠️
                                </div>


                                <h2
                                    className="
                                        text-xl
                                        font-semibold
                                        text-white
                                        mb-3
                                    "
                                >
                                    Alert Rule Test
                                </h2>


                                <p
                                    className="
                                        text-slate-400
                                        text-sm
                                        mb-6
                                        leading-6
                                    "
                                >
                                    Generate a FAILED_LOGIN event
                                    to verify your existing
                                    rule-based Alert Engine.
                                </p>


                                <div
                                    className="
                                        bg-slate-900/70
                                        border
                                        border-slate-800
                                        rounded-xl
                                        p-4
                                        mb-6
                                        text-left
                                        text-sm
                                    "
                                >

                                    <p className="text-slate-400">
                                        Event Type:
                                        <span className="text-cyan-400 ml-2">
                                            FAILED_LOGIN
                                        </span>
                                    </p>

                                    <p className="text-slate-400 mt-2">
                                        Value:
                                        <span className="text-white ml-2">
                                            8
                                        </span>
                                    </p>

                                    <p className="text-slate-400 mt-2">
                                        Source:
                                        <span className="text-white ml-2">
                                            Firewall
                                        </span>
                                    </p>

                                </div>


                                <PrimaryButton
                                    onClick={sendNormalTestEvent}
                                    disabled={normalLoading}
                                    className="
                                        bg-amber-600
                                        hover:bg-amber-500
                                        text-white
                                        w-full
                                    "
                                >

                                    {normalLoading
                                        ? "Processing..."
                                        : "Generate Rule Event"
                                    }

                                </PrimaryButton>

                            </div>

                        </GlassCard>


                        {/* =====================================
                            IOC AUTOMATION TEST
                        ====================================== */}

                        <GlassCard className="p-8">

                            <div className="text-center">

                                <div
                                    className="
                                        w-14
                                        h-14
                                        mx-auto
                                        mb-5
                                        rounded-2xl
                                        bg-red-500/10
                                        border
                                        border-red-500/20
                                        flex
                                        items-center
                                        justify-center
                                        text-2xl
                                    "
                                >
                                    🚨
                                </div>


                                <h2
                                    className="
                                        text-xl
                                        font-semibold
                                        text-white
                                        mb-3
                                    "
                                >
                                    IOC Detection Test
                                </h2>


                                <p
                                    className="
                                        text-slate-400
                                        text-sm
                                        mb-6
                                        leading-6
                                    "
                                >
                                    Test automatic IOC matching,
                                    threat creation, alert generation
                                    and real-time notification.
                                </p>


                                <div
                                    className="
                                        bg-slate-900/70
                                        border
                                        border-slate-800
                                        rounded-xl
                                        p-4
                                        mb-6
                                        text-left
                                        text-sm
                                    "
                                >

                                    <p className="text-slate-400">
                                        Event:
                                        <span className="text-cyan-400 ml-2">
                                            NETWORK_CONNECTION
                                        </span>
                                    </p>

                                    <p className="text-slate-400 mt-2">
                                        IOC Type:
                                        <span className="text-white ml-2">
                                            IP
                                        </span>
                                    </p>

                                    <p className="text-slate-400 mt-2">
                                        IOC Value:
                                        <span className="text-red-400 ml-2">
                                            185.220.101.10
                                        </span>
                                    </p>

                                    <p className="text-slate-400 mt-2">
                                        Source:
                                        <span className="text-white ml-2">
                                            Firewall
                                        </span>
                                    </p>

                                </div>


                                <PrimaryButton
                                    onClick={sendIOCTestEvent}
                                    disabled={iocLoading}
                                    className="
                                        bg-red-600
                                        hover:bg-red-500
                                        text-white
                                        w-full
                                    "
                                >

                                    {iocLoading
                                        ? "Analyzing IOC..."
                                        : "Generate IOC Event"
                                    }

                                </PrimaryButton>

                            </div>

                        </GlassCard>

                    </div>


                    {/* =====================================
                        AUTOMATION FLOW
                    ====================================== */}

                    <GlassCard
                        className="
                            max-w-5xl
                            mx-auto
                            mt-6
                            p-6
                        "
                    >

                        <h3
                            className="
                                text-white
                                font-semibold
                                mb-5
                                text-center
                            "
                        >
                            Cloud Security Automatic Detection Flow
                        </h3>


                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                justify-center
                                gap-3
                                text-xs
                            "
                        >

                            <FlowItem text="Security Event" />

                            <Arrow />

                            <FlowItem text="IOC Detection" />

                            <Arrow />

                            <FlowItem text="Threat Creation" />

                            <Arrow />

                            <FlowItem text="Alert Engine" />

                            <Arrow />

                            <FlowItem text="Notification" />

                        </div>

                    </GlassCard>


                </div>

            </main>

        </>

    );
}


// ==========================================
// SMALL UI COMPONENTS
// ==========================================

function FlowItem({ text }) {

    return (

        <div
            className="
                px-4
                py-2
                rounded-lg
                bg-slate-900
                border
                border-cyan-500/20
                text-cyan-400
                font-medium
            "
        >
            {text}
        </div>

    );

}


function Arrow() {

    return (

        <span
            className="
                text-slate-500
                text-lg
            "
        >
            →
        </span>

    );

}


export default TestAlertEngine;