"use client";

import React from "react";
import {
  Form,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Button,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
  Avatar,
} from "@nextui-org/react";

import { toast } from "react-toastify";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/register";

export default function App() {
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState<{
    [key: string]: string | File;
  } | null>(null);
  const [errors, setErrors] = React.useState<{
    fname?: string;
    email?: string;
    password?: string;
    terms?: string;
  }>({});
  const router = useRouter();

  // Password validation
  const getPasswordError = (value: string): string | undefined => {
    if (value.length < 4 && value.length > 1) {
      return "Must be 4 characters or more";
    }
    return undefined;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: { [key: string]: string | File } = {};

    // Convert FormData to a plain object
    formData.forEach((value, key) => {
      data[key] = value; // value is either string or File
    });

    // Custom validation
    const newErrors: { [key: string]: string } = {};

    // Handle password field (ensure it's a string)
    const password = data.password as string;
    const passwordError = getPasswordError(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (data.terms !== "true") {
      newErrors.terms = "You must accept the terms to continue";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);
    // Clear errors and proceed with submission
    setErrors({});
    setSubmitted(data);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsLoading(false);
        toast.success("Account created successfully");
        router.push("/login");
      } else {
        setIsLoading(false);
        const result = await response.json();
        toast.error(result.message);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Error creating account");
    }
  };

  return (
    <div className="flex justify-center items-center w-full pt-16">
      <Card className="w-full max-w-lg p-6 shadow-2xl">
        <CardHeader className="flex gap-3 items-center">
          <Image
            alt="logo"
            height={40}
            radius="sm"
            src="./yplexity-transparent.png"
            width={40}
          />
          <div className="flex flex-col">
            <p className="text-lg font-bold">YplexitY</p>
            <p className="text-sm text-gray-500">yplexity.com</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <Form className="p-2 w-full space-y-6" onSubmit={onSubmit}>
            <div className="flex flex-col gap-6 w-full">
              <Input isRequired label="Firstname" name="fname" />
              <Input isRequired label="Lastname" name="lname" />

              <Input
                isRequired
                errorMessage={({ validationDetails }) =>
                  validationDetails.valueMissing
                    ? "Please enter your email"
                    : "Please enter a valid email address"
                }
                label="Email"
                name="email"
                type="email"
              />

              <Input
                isRequired
                errorMessage={getPasswordError(password)}
                isInvalid={!!getPasswordError(password)}
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Select isRequired label="Country" name="country">
                <SelectItem
                  key="argentina"
                  startContent={
                    <Avatar
                      alt="Argentina"
                      className="w-6 h-6"
                      src="https://flagcdn.com/ar.svg"
                    />
                  }
                >
                  Argentina
                </SelectItem>
                <SelectItem
                  key="venezuela"
                  startContent={
                    <Avatar
                      alt="Venezuela"
                      className="w-6 h-6"
                      src="https://flagcdn.com/ve.svg"
                    />
                  }
                >
                  Venezuela
                </SelectItem>
                <SelectItem
                  key="brazil"
                  startContent={
                    <Avatar
                      alt="Brazil"
                      className="w-6 h-6"
                      src="https://flagcdn.com/br.svg"
                    />
                  }
                >
                  Brazil
                </SelectItem>
                <SelectItem
                  key="switzerland"
                  startContent={
                    <Avatar
                      alt="Switzerland"
                      className="w-6 h-6"
                      src="https://flagcdn.com/ch.svg"
                    />
                  }
                >
                  Switzerland
                </SelectItem>
                <SelectItem
                  key="germany"
                  startContent={
                    <Avatar
                      alt="Germany"
                      className="w-6 h-6"
                      src="https://flagcdn.com/de.svg"
                    />
                  }
                >
                  Germany
                </SelectItem>
                <SelectItem
                  key="india"
                  startContent={
                    <Avatar
                      alt="India"
                      className="w-6 h-6"
                      src="https://flagcdn.com/in.svg"
                    />
                  }
                >
                  India
                </SelectItem>
                <SelectItem
                  key="spain"
                  startContent={
                    <Avatar
                      alt="Spain"
                      className="w-6 h-6"
                      src="https://flagcdn.com/es.svg"
                    />
                  }
                >
                  Spain
                </SelectItem>
                <SelectItem
                  key="france"
                  startContent={
                    <Avatar
                      alt="France"
                      className="w-6 h-6"
                      src="https://flagcdn.com/fr.svg"
                    />
                  }
                >
                  France
                </SelectItem>
                <SelectItem
                  key="italy"
                  startContent={
                    <Avatar
                      alt="Italy"
                      className="w-6 h-6"
                      src="https://flagcdn.com/it.svg"
                    />
                  }
                >
                  Italy
                </SelectItem>
                <SelectItem
                  key="mexico"
                  startContent={
                    <Avatar
                      alt="Mexico"
                      className="w-6 h-6"
                      src="https://flagcdn.com/mx.svg"
                    />
                  }
                >
                  Mexico
                </SelectItem>
              </Select>

              <Checkbox
                isRequired
                isInvalid={!!errors.terms}
                name="terms"
                value="true"
                onChange={() =>
                  setErrors((prev) => ({
                    ...prev,
                    terms: undefined,
                  }))
                }
              >
                I agree to the terms and conditions
              </Checkbox>

              {errors.terms && (
                <span className="text-red-500 text-sm">{errors.terms}</span>
              )}

              <Button
                isLoading={isLoading}
                className="w-full bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg hover:shadow-xl"
                type="submit"
              >
                Register
              </Button>
            </div>
          </Form>
        </CardBody>
        <Divider />
        <CardFooter>
          <Link isExternal href="#">
            Caution! Site Under Construction
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
