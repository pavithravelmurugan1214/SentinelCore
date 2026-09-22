package backend.collector;

import backend.collector.model.LogFile;
import backend.dto.SecurityEvent;
import backend.entity.IOC;
import backend.enums.LogSource;
import backend.service.AlertEngineService;
import backend.service.IOCDetectionService;
import backend.service.ThreatService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.RandomAccessFile;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class LogWatcherService {

    private final LogParser logParser;
    private final AlertEngineService alertEngineService;
    private final IOCDetectionService iocDetectionService;
    private final ThreatService threatService;

    private final List<LogFile> logFiles = new ArrayList<>();

    /*
     * Constructor Injection
     */
    public LogWatcherService(
            LogParser logParser,
            AlertEngineService alertEngineService,
            IOCDetectionService iocDetectionService,
            ThreatService threatService
    ) {

        this.logParser = logParser;
        this.alertEngineService = alertEngineService;
        this.iocDetectionService = iocDetectionService;
        this.threatService = threatService;

        /*
         * Register Log Sources
         */

        logFiles.add(
                new LogFile(
                        Paths.get("../logs/firewall.log"),
                        LogSource.FIREWALL
                )
        );

        logFiles.add(
                new LogFile(
                        Paths.get("../logs/windows.log"),
                        LogSource.WINDOWS
                )
        );

        logFiles.add(
                new LogFile(
                        Paths.get("../logs/linux.log"),
                        LogSource.LINUX
                )
        );

        logFiles.add(
                new LogFile(
                        Paths.get("../logs/apache.log"),
                        LogSource.APACHE
                )
        );

        logFiles.add(
                new LogFile(
                        Paths.get("../logs/vpn.log"),
                        LogSource.VPN
                )
        );

        // Initialize log directories and files if they do not exist
        for (LogFile lf : logFiles) {
            try {
                java.nio.file.Path path = lf.getPath();
                if (path.getParent() != null && !java.nio.file.Files.exists(path.getParent())) {
                    java.nio.file.Files.createDirectories(path.getParent());
                }
                if (!java.nio.file.Files.exists(path)) {
                    java.nio.file.Files.createFile(path);
                }
            } catch (Exception e) {
                System.err.println("Could not initialize log file: " + lf.getPath() + " - " + e.getMessage());
            }
        }

        System.out.println("\n========================================");
        System.out.println("SentinelCore Log Collector Started");
        System.out.println("Monitoring " + logFiles.size() + " log sources");
        System.out.println("========================================\n");
    }


    /*
     * Run Collector Every 1 Second
     */
    @Scheduled(fixedDelay = 1000)
    public void collectLogs() {

        for (LogFile logFile : logFiles) {

            watch(logFile);

        }
    }


    /*
     * Watch Individual Log File
     */
    private void watch(LogFile logFile) {

        try (RandomAccessFile file =
                     new RandomAccessFile(
                             logFile.getPath().toFile(),
                             "r"
                     )) {

            /*
             * Continue reading from last position
             */
            file.seek(logFile.getLastPosition());

            String line;

            while ((line = file.readLine()) != null) {

                /*
                 * Ignore empty lines
                 */
                if (line.trim().isEmpty()) {
                    continue;
                }

                System.out.println("\n========================================");
                System.out.println("NEW SECURITY LOG DETECTED");
                System.out.println("Source : " + logFile.getSource());
                System.out.println("Log    : " + line);
                System.out.println("========================================");


                /*
                 * STEP 1
                 * Parse Raw Log
                 */
                SecurityEvent event =
                        logParser.parse(line);

                if (event == null) {

                    System.out.println(
                            "Unable to parse security event."
                    );

                    continue;
                }


                /*
                 * STEP 2
                 * Set Actual Log Source
                 */
                event.setSource(
                        logFile.getSource().name()
                );


                /*
                 * STEP 3
                 * IOC Detection
                 */
                Optional<IOC> matchedIOC =
                        iocDetectionService.analyzeEvent(event);


                /*
                 * STEP 4
                 * Automatic Threat Creation
                 */
                if (matchedIOC.isPresent()) {

                    IOC ioc = matchedIOC.get();

                    System.out.println(
                            "\n🚨 MALICIOUS IOC DETECTED"
                    );

                    System.out.println(
                            "IOC Value : " + ioc.getValue()
                    );

                    System.out.println(
                            "IOC Type  : " + ioc.getType()
                    );

                    System.out.println(
                            "Risk      : " + ioc.getRiskLevel()
                    );


                    threatService.createThreatAutomatically(

                            "IOC Match : " + ioc.getValue(),

                            ioc.getRiskLevel(),

                            event.getSource()

                    );

                    // Create IOC-specific security event
                    SecurityEvent iocEvent = new SecurityEvent();

                    iocEvent.setEventType("IOC_MATCH");
                    iocEvent.setValue(1);
                    iocEvent.setSource(event.getSource());

                    iocEvent.setDescription(
                            "Known malicious IOC detected: " + ioc.getValue()
                    );

                    iocEvent.setIndicator(ioc.getValue());
                    iocEvent.setIndicatorType(ioc.getType());

                    iocEvent.setSourceIp(event.getSourceIp());

// Send IOC event to Alert Engine
                    System.out.println(
                            "\nSending IOC_MATCH event to Alert Engine..."
                    );

                    alertEngineService.processEvent(iocEvent);

                } else {

                    System.out.println(
                            "No malicious IOC detected."
                    );
                }


                /*
                 * STEP 5
                 * Send Event to Alert Engine
                 */
                System.out.println(
                        "\nSending event to Alert Engine..."
                );

                alertEngineService.processEvent(event);

            }


            /*
             * Remember last file position
             */
            logFile.setLastPosition(
                    file.getFilePointer()
            );

        } catch (Exception e) {

            System.err.println(
                    "Error reading log file: "
                            + logFile.getPath()
            );

            System.err.println(
                    "Reason: " + e.getMessage()
            );
        }
    }
}