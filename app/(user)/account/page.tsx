"use client";

import { useAuth } from "@/store/auth";
import React, { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Button,
    Form,
    Input,
    Select,
    SelectItem,
    Avatar,
    Divider,
    Link,
    Image,
} from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { SessionUser } from "@/types/index";
import { toast } from "react-toastify";

export default function App() {

    const { isLoggedIn } = useAuth();
    const { logout } = useAuth();
    const router = useRouter();;
    const [userData, setUserData] = useState({
        fname: "",
        lname: "",
        email: "",
        password: "",
        country: "",
        avatar: "", // Stores the avatar URL
    });

    const [imagePreview, setImagePreview] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { data: session, status } = useSession();


    useEffect(() => {
        if (status === "loading") {
            // Wait for session to load before checking the login status
            return;
        }
        if (!session) {
            router.push("/login");
        } else {

            const fetchUserInfo = async () => {
                if (session) {
                    const { id } = session.user as SessionUser;

                    try {
                        const userInfo = await getUserInfo(id); // Await the result of getUserInfo

                        if (userInfo) {
                            const { fname, lname, email, avatar, country } = userInfo as SessionUser;

                            setUserData((prevData) => ({
                                ...prevData,
                                fname: fname || prevData.fname,
                                lname: lname || prevData.lname,
                                email: email || prevData.email,
                                country: country || prevData.country,
                                avatar: avatar || prevData.avatar,
                            }));


                            console.log("Fetched user data:", userInfo);
                        }
                    } catch (error) {
                        console.error("Failed to fetch user info:", error);
                    }
                }
            };
            fetchUserInfo(); // Call the async function
        }

    }, [session, status, router]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string); // Set the image preview URL
                //"Image preview set to:", reader.result); // Debugging log
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        setIsLoading(true);
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const { jwtToken } = session?.user as SessionUser;
        if (jwtToken) {
            formData.append("token", jwtToken);
        }
        const { id } = session?.user as SessionUser;
        formData.append("id", id);


        try {
            const res = await fetch("/api/update", {
                method: "POST",
                body: formData,
            });
            if (res.ok) {
                toast.success("Account Updated successfully!");
                setIsLoading(false);
            } else {
                const error = await res.json();
                toast.error(error.Message);
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Something Went Wrong");
            setIsLoading(false);
        }
    };

    const getUserInfo = async (id: string) => {
        try {
            const response = await fetch("/api/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: id }),
            });

            if (response.ok) {
                const result = await response.json();
                //"User info fetched:", result.account); // Debugging log
                return result.account;
            } else {
                const errorResult = await response.json();
                console.error("Error fetching user info:", errorResult);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };




    return (
        <div className="flex justify-center items-center w-full">
            <Card className="lg:w-1/2">
                <Form className="p-2 w-full space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
                    <CardHeader className="flex gap-3 justify-between w-full">
                        <div className="profile flex items-center gap-x-4">
                            <div className="avatar flex-col justify-center">
                                <label htmlFor="file-input" className="cursor-pointer">
                                    <Image
                                        radius="full"
                                        className="object-cover lg:w-32 lg:h-32 w-16 h-16 opacity-100"
                                        src={imagePreview || userData.avatar || undefined} // Use imagePreview or userData.avatar
                                    />
                                </label>
                                <Input
                                    id="file-input"
                                    type="file"
                                    name="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div className="flex flex-col">
                                <p className="text-small">{userData.fname + " " + userData.lname}</p>
                                <p className="text-xs text-default-500">{userData.email}</p>
                            </div>
                        </div>
                        <Button size="md" color="danger" onPress={logout}>
                            Logout
                        </Button>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <div className="flex flex-col gap-6 w-full">
                            <Input
                                isRequired
                                label="Firstname"
                                name="fname"
                                value={userData.fname}
                                onChange={handleChange}
                            />
                            <Input
                                isRequired
                                label="Lastname"
                                name="lname"
                                value={userData.lname}
                                onChange={handleChange}
                            />
                            <Input
                                isRequired
                                label="Email"
                                name="email"
                                type="email"
                                value={userData.email}
                                onChange={handleChange}
                            />
                            <Input
                                isRequired
                                isDisabled
                                label="Password"
                                name="password"
                                type="password"
                                value={userData.password}
                                onChange={handleChange}
                            />
                            <Select
                                className=""
                                isRequired
                                label="Country"

                                name="country"
                                selectionMode={"single"}
                                onChange={(e) => handleChange(e)} // Pass the event to 
                                selectedKeys={[userData.country]}
                            >

                                <SelectItem
                                    key="argentina"
                                    startContent={
                                        <Avatar alt="Argentina" className="w-6 h-6" src="https://flagcdn.com/ar.svg" />
                                    }
                                >
                                    Argentina
                                </SelectItem>
                                <SelectItem
                                    key="venezuela"
                                    startContent={
                                        <Avatar alt="Venezuela" className="w-6 h-6" src="https://flagcdn.com/ve.svg" />
                                    }
                                >
                                    Venezuela
                                </SelectItem>
                                <SelectItem
                                    key="brazil"
                                    startContent={<Avatar alt="Brazil" className="w-6 h-6" src="https://flagcdn.com/br.svg" />}
                                >
                                    Brazil
                                </SelectItem>
                                <SelectItem
                                    key="switzerland"
                                    startContent={
                                        <Avatar alt="Switzerland" className="w-6 h-6" src="https://flagcdn.com/ch.svg" />
                                    }
                                >
                                    Switzerland
                                </SelectItem>
                                <SelectItem
                                    key="germany"
                                    startContent={<Avatar alt="Germany" className="w-6 h-6" src="https://flagcdn.com/de.svg" />}
                                >
                                    Germany
                                </SelectItem>
                                <SelectItem
                                    key="india"
                                    startContent={<Avatar alt="India" className="w-6 h-6" src="https://flagcdn.com/in.svg" />}
                                >
                                    India
                                </SelectItem>
                                <SelectItem
                                    key="spain"
                                    startContent={<Avatar alt="Spain" className="w-6 h-6" src="https://flagcdn.com/es.svg" />}
                                >
                                    Spain
                                </SelectItem>
                                <SelectItem
                                    key="france"
                                    startContent={<Avatar alt="France" className="w-6 h-6" src="https://flagcdn.com/fr.svg" />}
                                >
                                    France
                                </SelectItem>
                                <SelectItem
                                    key="italy"
                                    startContent={<Avatar alt="Italy" className="w-6 h-6" src="https://flagcdn.com/it.svg" />}
                                >
                                    Italy
                                </SelectItem>
                                <SelectItem
                                    key="mexico"
                                    startContent={<Avatar alt="Mexico" className="w-6 h-6" src="https://flagcdn.com/mx.svg" />}
                                >
                                    Mexico
                                </SelectItem>
                            </Select>




                            <Button
                                isLoading={isLoading}
                                className="w-full bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg hover:shadow-xl"
                                type="submit"
                            >
                                Save
                            </Button>
                        </div>
                    </CardBody>
                    <Divider />
                    <CardFooter>
                        <Link isExternal showAnchorIcon href="">
                            Update at your own risk
                        </Link>
                    </CardFooter>
                </Form>
            </Card>
        </div>
    );
}
