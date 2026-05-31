-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" BIGSERIAL NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" BIGSERIAL NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);
