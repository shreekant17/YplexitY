"use client";

import React, { FormEvent, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  Input,
  Checkbox,
  Textarea,
  Image,
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Typing for the props passed to the UploadPost component
type UploadPostProps = {
  isOpen: boolean;
  onClose: () => void;
};
import { useState } from "react";

interface SessionUser {
  id: string;
  name?: string; // Other properties, if applicable
  jwtToken: string;
}

const UploadPost = ({ isOpen, onClose }: UploadPostProps) => {
  const size = "lg";

  const router = useRouter();
  // Typing the state variables
  const [btnStatus, setBtnStatus] = React.useState<boolean>(true);
  const [submitted, setSubmitted] = React.useState<any>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const { data: session, status } = useSession();
  const [token, setToken] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBtnStatus(true);
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      // Create a preview URL for the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Set the image preview URL
      };
      reader.readAsDataURL(file); // Read the file as data URL
      setBtnStatus(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (token) {
      formData.append("token", token);
    }

    try {
      const res = await fetch("/api/postCloud", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast.success("Post created successfully!");
        router.push("/feed");
      } else {
        const error = await res.json();
        toast.error(error.Message);
      }
    } catch (error) {
      //console.error("Upload error:", error);
      toast.error("Error creating post");
    }
  };

  useEffect(() => {
    if (session) {
      const token = (session?.user as SessionUser).jwtToken || "";
      setToken(token);
    }
  }, [session]);

  return (
    <div>
      <Modal isOpen={isOpen} size={size} onClose={onClose}>
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              Create New Post
            </ModalHeader>
            <ModalBody>
              <Form
                id="upload-form"
                className="p-4 w-full justify-center items-center space-y-4"
                validationBehavior="native"
                encType="multipart/form-data"
                onSubmit={handleSubmit}
              >
                <div className="flex flex-col gap-4 max-w-md">
                  {imagePreview && (
                    <Image
                      alt=""
                      src={imagePreview}
                      height={300}
                      width={300}
                      className="mb-4"
                    />
                  )}

                  <Input
                    isRequired
                    label="Image"
                    labelPlacement="outside"
                    name="file"
                    placeholder="Enter your email"
                    type="file"
                    onChange={handleFileChange} // Add onChange handler
                    className="w-full"
                  />
                  <RadioGroup
                    name="type"
                    label="Select Media Type"
                    orientation="horizontal"
                    isRequired
                  >
                    <Radio value="image">Picture</Radio>
                    <Radio value="video">Video</Radio>
                  </RadioGroup>
                  <Textarea
                    isClearable
                    className="w-full"
                    defaultValue=""
                    label="Description"
                    placeholder="Description"
                    variant="bordered"
                    name="content"
                  />
                </div>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                form="upload-form"
                onPress={onClose}
                type="submit"
                isDisabled={btnStatus}
                className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
                color="primary"
              >
                Post
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UploadPost;
