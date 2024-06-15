import React, { useState, useEffect } from "react";
import { AlignRightOutlined, DollarOutlined, SwapOutlined } from "@ant-design/icons";
import { Modal, Input, InputNumber } from "antd";
import { ethers } from "ethers";

function RequestAndPay({ state, requests, getNameAndBalance }) {
    const [payModal, setPayModal] = useState(false);
    const [requestModal, setRequestModal] = useState(false);
    const [requestAmount, setRequestAmount] = useState(1);
    const [requestAddress, setRequestAddress] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const showPayModal = () => {
        setPayModal(true);
    };
    const hidePayModal = () => {
        setPayModal(false);
    };

    const showRequestModal = () => {
        setRequestModal(true);
    };
    const hideRequestModal = () => {
        setRequestModal(false);
    };
    const RequestaPayment = async () => {
        const { contract } = state;
        try {
            const payableAmount = String(Number((requests["1"][0]) * 1e18))
            const transaction = await contract.payRequest(0, { value: payableAmount })
            hidePayModal();
            await transaction.wait();
            alert("pay thanh cong")
            setIsSuccess(true);
        } catch (error) {
            console.log(error)
            setIsSuccess(false)
        }

    }
    const createRequest = async () => {
        const { contract } = state;
        try {
            const transaction = await contract.createRequest(requestAddress, requestAmount, requestMessage);
            hideRequestModal();
            await transaction.wait();
            alert("tao yeu cau thanh cong")
            setIsSuccess(true);
        } catch (error) {
            console.log(error);
            setIsSuccess(false);
        }

    }
    useEffect(() => {
        if (isSuccess) {
            getNameAndBalance();
        }
    }, [isSuccess])
    return (
        <>
            <Modal
                title="Confirm Payment"
                open={payModal}
                onOk={RequestaPayment}
                onCancel={hidePayModal}
                okText="Proceed To Pay"
                cancelText="Cancel"
            >
                {requests && requests["0"].length > 0 && (
                    <>
                        <h2>Sending payment to {requests["3"][0]}</h2>
                        <h3>Value: {Number(ethers.utils.formatEther(requests["1"][0]) * 1e18)} Matic</h3>
                        <p>"{requests["2"][0]}"</p>
                    </>
                )}
            </Modal>
            <Modal
                title="Request A Payment"
                open={requestModal}
                onOk={createRequest}
                onCancel={hideRequestModal}
                okText="Proceed To Request"
                cancelText="Cancel"
            >
                <p>Amount (Matic)</p>
                <InputNumber value={requestAmount} onChange={(val) => setRequestAmount(val)} />
                <p>From (address)</p>
                <Input placeholder="0x..." value={requestAddress} onChange={(val) => setRequestAddress(val.target.value)} />
                <p>Message</p>
                <Input placeholder="Lunch Bill..." value={requestMessage} onChange={(val) => setRequestMessage(val.target.value)} />
            </Modal>
            <div className="requestAndPay">
                <div
                    className="quickOption"
                    onClick={() => {
                        showPayModal();
                    }}
                >
                    <DollarOutlined style={{ fontSize: "26px" }} />
                    Pay
                    {requests && requests["0"].length > 0 && (
                        <div className="numReqs">{requests["0"].length}</div>
                    )}

                </div>
                <div
                    className="quickOption"
                    onClick={() => {
                        showRequestModal();
                    }}
                >
                    <SwapOutlined style={{ fontSize: "26px" }} />
                    Request
                </div>
            </div>
        </>
    );

}
export default RequestAndPay;