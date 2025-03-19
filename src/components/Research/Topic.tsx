"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useDeepResearch from "@/hooks/useDeepResearch";
import { useGlobalStore } from "@/store/global";
import { useSettingStore } from "@/store/setting";
import { useTaskStore } from "@/store/task";

const formSchema = z.object({
  topic: z.string().min(2),
});

function Topic() {
  const { t } = useTranslation();
  const { askQuestions } = useDeepResearch();
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    const { apiKey, accessPassword } = useSettingStore.getState();
    if (apiKey || accessPassword) {
      const { setQuestion } = useTaskStore.getState();
      setIsThinking(true);
      setQuestion(values.topic);
      await askQuestions();
      setIsThinking(false);
    } else {
      const { setOpenSetting } = useGlobalStore.getState();
      setOpenSetting(true);
    }
  }

  return (
    <section className="p-4 border rounded-md mt-4">
      <h3 className="font-semibold text-lg border-b mb-2 leading-10">
        {t("research.topic.title")}
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 font-semibold">
                  {t("research.topic.topicLabel")}
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder={t("research.topic.topicPlaceholder")}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button className="mt-4 w-full" disabled={isThinking} type="submit">
            {isThinking ? (
              <>
                <LoaderCircle className="animate-spin" />
                {t("research.common.thinkingQuestion")}
              </>
            ) : (
              t("research.common.startThinking")
            )}
          </Button>
        </form>
      </Form>
    </section>
  );
}

export default Topic;
